const inputUsuario = document.getElementById('input_usuario');
const inputSenha   = document.getElementById('input_senha');
const modal        = document.getElementById('modal');

function validar(input, wrapId) {
    const wrap = document.getElementById(wrapId);
    if (!input.value.trim()) {
        wrap.classList.add('erro');
        input.placeholder = 'PREENCHER AQUI';
        return false;
    }
    wrap.classList.remove('erro');
    return true;
}

// Remove erro ao digitar
inputUsuario.addEventListener('input', function() {
    document.getElementById('wrap-usuario').classList.remove('erro');
    inputUsuario.placeholder = 'Usuário';
});
inputSenha.addEventListener('input', function() {
    document.getElementById('wrap-senha').classList.remove('erro');
    inputSenha.placeholder = 'Senha';
});

function acessar() {
    const ok1 = validar(inputUsuario, 'wrap-usuario');
    const ok2 = validar(inputSenha, 'wrap-senha');
    if (ok1 && ok2) modal.classList.add('ativo');
}

function cadastrar() {
}

function fecharModal(e) {
    if (!e || e.target === modal) modal.classList.remove('ativo');
}

function toggleSenha() {
    inputSenha.type = inputSenha.type === 'password' ? 'text' : 'password';
}
