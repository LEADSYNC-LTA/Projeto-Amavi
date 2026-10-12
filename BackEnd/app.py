"""API e frontend Amavi. Execute os comandos descritos no README."""
import base64
import binascii
import io
import os
import re
import secrets
import uuid
from datetime import timedelta
from decimal import Decimal, InvalidOperation
from functools import wraps
from pathlib import Path
from urllib.parse import urlencode

import click
from dotenv import load_dotenv
from flask import Flask, jsonify, request, session, send_file, send_from_directory
from flask_sqlalchemy import SQLAlchemy
from flask_limiter import Limiter
from flask_limiter.util import get_remote_address
from PIL import Image, UnidentifiedImageError
from sqlalchemy.dialects.mysql import LONGBLOB
from sqlalchemy.engine import URL
from sqlalchemy.exc import IntegrityError, SQLAlchemyError
from werkzeug.exceptions import HTTPException
from werkzeug.security import generate_password_hash, check_password_hash

load_dotenv(Path(__file__).with_name('.env'))
db = SQLAlchemy()
CATEGORIES = ['Blusas', 'Vestidos', 'Calças', 'Saias', 'Conjuntos', 'Acessórios']
SIZES = ['PP', 'P', 'M', 'G', 'GG', 'XG', 'Único']


def uid():
    return uuid.uuid4().hex


class User(db.Model):
    __tablename__ = 'users'
    id = db.Column(db.String(32), primary_key=True, default=uid)
    name = db.Column(db.String(120), nullable=False)
    email = db.Column(db.String(254), unique=True, nullable=False)
    password_hash = db.Column(db.String(255), nullable=False)
    role = db.Column(db.String(10), nullable=False, default='user')

    def public(self):
        return dict(id=self.id, name=self.name, email=self.email, role=self.role)


class Product(db.Model):
    __tablename__ = 'products'
    id = db.Column(db.String(32), primary_key=True, default=uid)
    name = db.Column(db.String(160), nullable=False)
    description = db.Column(db.Text, nullable=False)
    category = db.Column(db.String(40), nullable=False)
    price = db.Column(db.Numeric(10, 2), nullable=False)
    stock = db.Column(db.Integer, nullable=False)
    sizes = db.Column(db.JSON, nullable=False)
    colors = db.Column(db.JSON, nullable=False)
    is_new = db.Column(db.Boolean, nullable=False, default=True)
    images = db.relationship('ProductImage', cascade='all, delete-orphan', order_by='ProductImage.position')
    __table_args__ = (db.CheckConstraint('price > 0'), db.CheckConstraint('stock >= 0'))

    def public(self):
        return dict(id=self.id, name=self.name, description=self.description,
                    category=self.category, price=float(self.price), stock=self.stock,
                    sizes=self.sizes, colors=self.colors, isNew=self.is_new,
                    images=[f'/api/images/{image.id}' for image in self.images])


class ProductImage(db.Model):
    __tablename__ = 'product_images'
    id = db.Column(db.String(32), primary_key=True, default=uid)
    product_id = db.Column(db.String(32), db.ForeignKey('products.id'), nullable=False)
    position = db.Column(db.Integer, nullable=False)
    # LONGBLOB suporta as fotos no MySQL; o banco e seu backup incluem as imagens.
    data = db.deferred(db.Column(db.LargeBinary().with_variant(LONGBLOB(), 'mysql'), nullable=False))
    __table_args__ = (db.CheckConstraint('position >= 0 AND position < 4'),)


def fail(message, code=400):
    from flask import abort
    abort(code, description=message)


def body():
    data = request.get_json(silent=True)
    if not isinstance(data, dict):
        fail('Envie um objeto JSON válido.')
    return data


def text_field(data, name, limit, required=True):
    value = data.get(name, '')
    if not isinstance(value, str) or len(value.strip()) > limit or (required and not value.strip()):
        fail(f'Campo {name} inválido (máximo {limit} caracteres).')
    return value.strip()


def account(data):
    name = text_field(data, 'name', 120)
    email = text_field(data, 'email', 254).lower()
    if not re.fullmatch(r'[^\s@]+@[^\s@]+\.[^\s@]+', email):
        fail('Informe um e-mail válido.')
    password = data.get('password')
    if not isinstance(password, str) or not 8 <= len(password) <= 128:
        fail('A senha deve ter entre 8 e 128 caracteres.')
    return name, email, password


def product_values(data):
    values = {key: text_field(data, key, limit, key != 'description')
              for key, limit in [('name', 160), ('description', 5000), ('category', 40)]}
    if values['category'] not in CATEGORIES:
        fail('Categoria inválida.')
    try:
        price = Decimal(str(data.get('price')))
        if not price.is_finite() or not 0 < price <= Decimal('99999999.99') or price != price.quantize(Decimal('.01')):
            raise ValueError()
    except (InvalidOperation, ValueError):
        fail('Preço inválido; use até duas casas decimais.')
    stock = data.get('stock')
    if type(stock) is not int or not 0 <= stock <= 2147483647:
        fail('Estoque deve ser um número inteiro não negativo.')
    for key in ['sizes', 'colors']:
        items = data.get(key)
        if not isinstance(items, list) or not 1 <= len(items) <= 30 or any(
                not isinstance(x, str) or not x.strip() or len(x) > 60 for x in items):
            fail(f'Informe ao menos um valor válido em {key}.')
        values[key] = list(dict.fromkeys(x.strip() for x in items))
    if any(size not in SIZES for size in values['sizes']):
        fail('Tamanho inválido.')
    if type(data.get('isNew')) is not bool:
        fail('O campo isNew deve ser booleano.')
    values.update(price=price, stock=stock, is_new=data['isNew'])
    return values


def prepare_images(values, existing):
    if not isinstance(values, list) or not 1 <= len(values) <= 4:
        fail('Cada produto deve ter de 1 a 4 imagens.')
    result = []
    used = set()
    for value in values:
        if not isinstance(value, str):
            fail('Imagem inválida.')
        if value in existing:
            if value in used:
                fail('Uma imagem não pode ser repetida.')
            used.add(value)
            result.append(existing[value])
            continue
        match = re.fullmatch(r'data:image/(?:jpeg|png|webp);base64,([A-Za-z0-9+/=\s]+)', value)
        if not match or len(value) > 7_000_000:
            fail('Use imagens JPG, PNG ou WEBP de até 5 MB.')
        try:
            raw = base64.b64decode(match[1], validate=True)
            if len(raw) > 5 * 1024 * 1024:
                fail('Cada imagem pode ter no máximo 5 MB.')
            with Image.open(io.BytesIO(raw)) as picture:
                if picture.format not in ('JPEG', 'PNG', 'WEBP') or picture.width * picture.height > 20_000_000:
                    fail('Imagem inválida ou grande demais (máximo 20 megapixels).')
                picture.load()
                output = io.BytesIO()
                # Regrava o conteúdo para remover metadados e conteúdo extra.
                picture.convert('RGB').save(output, format='JPEG', quality=90)
            result.append(ProductImage(data=output.getvalue()))
        except (binascii.Error, ValueError, OSError, UnidentifiedImageError, Image.DecompressionBombError):
            fail('Não foi possível ler a imagem. Use JPG, PNG ou WEBP válidos.')
    return result


def create_app(test_config=None):
    app = Flask(__name__, static_folder=None)
    mysql_url = URL.create('mysql+pymysql', username=os.getenv('DB_USER', 'amavi'),
                           password=os.getenv('DB_PASSWORD', ''), host=os.getenv('DB_HOST', '127.0.0.1'),
                           port=int(os.getenv('DB_PORT', '3306')), database=os.getenv('DB_NAME', 'amavi'),
                           query={'charset': 'utf8mb4'})
    app.config.update(SECRET_KEY=os.getenv('SECRET_KEY'), SQLALCHEMY_DATABASE_URI=mysql_url,
                      SQLALCHEMY_ENGINE_OPTIONS={'pool_pre_ping': True}, MAX_CONTENT_LENGTH=30 * 1024 * 1024,
                      SESSION_COOKIE_HTTPONLY=True, SESSION_COOKIE_SAMESITE='Lax',
                      SESSION_COOKIE_SECURE=os.getenv('COOKIE_SECURE', 'false').lower() == 'true',
                      PERMANENT_SESSION_LIFETIME=timedelta(hours=8))
    if test_config:
        app.config.update(test_config)
    if not app.config['SECRET_KEY']:
        raise RuntimeError('Defina SECRET_KEY no arquivo backend/.env antes de executar.')

        # Usa o certificado para verificar a conexão com a Aiven.
    if os.getenv("DB_SSL_CA"):
        certificado = Path(__file__).parent / os.environ["DB_SSL_CA"]

        app.config["SQLALCHEMY_ENGINE_OPTIONS"]["connect_args"] = {
            "ssl_ca": str(certificado),
            "ssl_verify_cert": True,
            "ssl_verify_identity": True,
        }
    db.init_app(app)

    limiter = Limiter(get_remote_address, app=app, storage_uri=os.getenv('RATELIMIT_STORAGE_URI', 'memory://'), default_limits=[])
    app.extensions['amavi_limiter'] = limiter
    frontend = Path(__file__).resolve().parents[1] / 'FrontEnd'

    def current_user():
        return db.session.get(User, session['user_id']) if session.get('user_id') else None

    def admin_only(fn):
        @wraps(fn)
        def wrapped(*args, **kwargs):
            user = current_user()
            if not user:
                fail('Entre na sua conta.', 401)
            if user.role != 'admin':
                fail('Acesso exclusivo para administradores.', 403)
            return fn(*args, **kwargs)
        return wrapped

    @app.before_request
    def csrf_check():
        if request.path.startswith('/api/') and request.method in ('POST', 'PUT', 'DELETE', 'PATCH'):
            token = session.get('csrf')
            provided = request.headers.get('X-CSRF-Token', '')
            if not token or not provided.isascii() or not secrets.compare_digest(token, provided):
                fail('Sessão expirada. Atualize a página e tente novamente.', 403)

    @app.after_request
    def headers(response):
        response.headers['X-Content-Type-Options'] = 'nosniff'
        response.headers['X-Frame-Options'] = 'DENY'
        if request.path.startswith('/api/') and not request.path.startswith('/api/images/'):
            response.headers['Cache-Control'] = 'no-store'
        return response

    @app.errorhandler(HTTPException)
    def http_error(error):
        return jsonify(error=error.description), error.code

    @app.errorhandler(SQLAlchemyError)
    def database_error(error):
        db.session.rollback()
        app.logger.exception('Falha no banco de dados')
        return jsonify(error='Não foi possível acessar o banco de dados. Tente novamente.'), 503

    @app.get('/')
    def index():
        return send_from_directory(frontend, 'index.html')

    @app.get('/<any(app.js,style.css):filename>')
    def assets(filename):
        return send_from_directory(frontend, filename)

    @app.get('/api/config')
    def config():
        return jsonify(store=dict(name='AMAVI', tagline='Coisas boas acontecem quando você coloca um look novo',
                                  whatsappNumber=os.getenv('WHATSAPP_NUMBER', '5511999999999'),
                                  instagramHandle=os.getenv('INSTAGRAM_HANDLE', 'amavi.moda'),
                                  instagramUrl='https://instagram.com/' + os.getenv('INSTAGRAM_HANDLE', 'amavi.moda'),
                                  freeShippingThreshold=float(os.getenv('FREE_SHIPPING_THRESHOLD', '300'))),
                       categories=CATEGORIES, sizes=SIZES)

    @app.get('/api/auth/session')
    def get_session():
        if 'csrf' not in session:
            session['csrf'] = secrets.token_urlsafe(32)
        user = current_user()
        return jsonify(user=user.public() if user else None, csrfToken=session['csrf'])

    @app.post('/api/auth/register')
    @limiter.limit('10 per minute')
    def register():
        data = body()
        if data.get('role', 'user') != 'user':
            fail('Administradores devem ser criados pelo responsável da loja.', 403)
        name, email, password = account(data)
        user = User(name=name, email=email, password_hash=generate_password_hash(password), role='user')
        db.session.add(user)
        try:
            db.session.commit()
        except IntegrityError:
            db.session.rollback()
            fail('Já existe uma conta cadastrada com este e-mail.', 409)
        return jsonify(user=user.public()), 201

    @app.post('/api/auth/login')
    @limiter.limit('10 per minute')
    def login():
        data = body()
        email = text_field(data, 'email', 254).lower()
        password = data.get('password')
        if not isinstance(password, str) or len(password) > 128:
            fail('E-mail ou senha inválidos.', 401)
        user = db.session.scalar(db.select(User).where(User.email == email))
        if not user or not check_password_hash(user.password_hash, password):
            fail('E-mail ou senha inválidos.', 401)
        session.clear()
        session.update(user_id=user.id, csrf=secrets.token_urlsafe(32))
        session.permanent = True
        return jsonify(user=user.public(), csrfToken=session['csrf'])

    @app.post('/api/auth/logout')
    def logout():
        session.clear()
        session['csrf'] = secrets.token_urlsafe(32)
        return jsonify(user=None, csrfToken=session['csrf'])

    @app.get('/api/products')
    def products():
        return jsonify([p.public() for p in db.session.scalars(db.select(Product).order_by(Product.id.desc()))])

    @app.get('/api/products/<product_id>')
    def product(product_id):
        return jsonify(db.get_or_404(Product, product_id).public())

    @app.post('/api/products')
    @admin_only
    def create_product():
        data = body()
        p = Product(**product_values(data))
        p.images = prepare_images(data.get('images'), {})
        for pos, image in enumerate(p.images):
            image.position = pos
        db.session.add(p)
        db.session.commit()
        return jsonify(p.public()), 201

    @app.put('/api/products/<product_id>')
    @admin_only
    def update_product(product_id):
        # Trava a linha durante a alteração para evitar atualizações simultâneas.
        p = db.session.scalar(db.select(Product).where(Product.id == product_id).with_for_update())
        if not p:
            fail('Produto não encontrado.', 404)
        data = body()
        values = product_values(data)
        images = prepare_images(data.get('images'), {f'/api/images/{i.id}': i for i in p.images})
        for key, value in values.items():
            setattr(p, key, value)
        p.images = images
        for pos, image in enumerate(images):
            image.position = pos
        db.session.commit()
        return jsonify(p.public())

    @app.delete('/api/products/<product_id>')
    @admin_only
    def delete_product(product_id):
        db.session.delete(db.get_or_404(Product, product_id))
        db.session.commit()
        return '', 204

    @app.get('/api/images/<image_id>')
    def image(image_id):
        picture = db.get_or_404(ProductImage, image_id)
        return send_file(io.BytesIO(picture.data), mimetype='image/jpeg', max_age=86400)

    @app.post('/api/cart/quote')
    def quote():
        items = body().get('items')
        if not isinstance(items, list) or not 1 <= len(items) <= 100:
            fail('O carrinho deve conter entre 1 e 100 itens.')
        result, quantities, total = [], {}, Decimal('0')
        for item in items:
            if not isinstance(item, dict) or not isinstance(item.get('productId'), str):
                fail('Item inválido no carrinho.')
            p = db.get_or_404(Product, item['productId'])
            qty = item.get('qty')
            if type(qty) is not int or not 1 <= qty <= 999:
                fail('Quantidade inválida no carrinho.')
            if item.get('size') not in p.sizes or item.get('color') not in p.colors:
                fail(f'Tamanho ou cor indisponível: {p.name}.')
            quantities[p.id] = quantities.get(p.id, 0) + qty
            if quantities[p.id] > p.stock:
                fail(f'Estoque insuficiente para {p.name} (disponível: {p.stock}).')
            subtotal = p.price * qty
            total += subtotal
            result.append(dict(name=p.name, qty=qty, size=item['size'], color=item['color'], subtotal=float(subtotal)))
        lines = ['Olá, AMAVI! Quero fazer o seguinte pedido:', '']
        lines += [f"• {i['qty']}x {i['name']} — Tam. {i['size']} / Cor: {i['color']} — R$ {i['subtotal']:.2f}" for i in result]
        lines += ['', f'Total: R$ {total:.2f}', '', 'Podem me confirmar disponibilidade e forma de pagamento?']
        return jsonify(items=result, total=float(total), whatsappUrl='https://wa.me/' + os.getenv('WHATSAPP_NUMBER', '5511999999999') + '?' + urlencode({'text': '\n'.join(lines)}))

    @app.cli.command('init-db')
    def init_db():
        """Cria as tabelas no banco já existente."""
        db.create_all()
        click.echo('Tabelas criadas.')

    @app.cli.command('create-admin')
    @click.option('--name', prompt='Nome')
    @click.option('--email', prompt='E-mail')
    @click.option('--password', prompt=True, hide_input=True, confirmation_prompt=True)
    def create_admin(name, email, password):
        """Cria um administrador sem expor cadastro admin ao público."""
        name, email, password = account(dict(name=name, email=email, password=password))
        if db.session.scalar(db.select(User).where(User.email == email)):
            raise click.ClickException('E-mail já cadastrado.')
        db.session.add(User(name=name, email=email, password_hash=generate_password_hash(password), role='admin'))
        db.session.commit()
        click.echo('Administrador criado.')

    return app
