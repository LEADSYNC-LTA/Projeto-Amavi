# Login e cadastro Amavi

Foram adicionadas as rotas:
- `/login`: login de usuário ou administrador.
- `/cadastro`: cadastro com seleção de perfil Usuário/Administrador.
- `/admin/login`: redireciona para o login unificado.

Neste protótipo, usuários e sessão são armazenados no `localStorage`, seguindo a arquitetura simulada já existente no projeto. Para produção, autenticação, senhas e autorização de administrador devem ser transferidas para o back-end.

Credencial administrativa de demonstração:
- E-mail: `admin@amavi.com.br`
- Senha: `amavi123`

O novo visual usa rosa-bebê, cinza e branco e inclui `src/assets/fashion-icon.svg` como ícone de moda feminina.
