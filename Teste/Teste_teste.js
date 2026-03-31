function MostrarSenha(idInput,idImage){
  const input = document.getElementById(idInput);

  if (input.type === "password") {
    input.type = "text";
    idImage.textContent = "visibility_off";
  } else {
    input.type = "password";
    idImage.textContent = "visibility";
  }
}
function MostrarSenhaConfirmacao(idInput,elemento){
  const input = document.getElementById(idInput);

  if (input.type === "password") {
    input.type = "text";
    elemento.textContent = "visibility_off";
  } else {
    input.type = "password";
    elemento.textContent = "visibility";
  }
}


function gerarSenha(){
    const caracateres = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ#$&*-!123456789'
    var senha_gerada = ''
    
    for (var i = 0; i <= 8; i++){
        var letra = caracateres[parseInt(Math.random()*(caracateres.length-1))]
        senha_gerada += letra
    }
    
    input_senha_cadastro.value = senha_gerada
    input_confirmacao_senha.value = senha_gerada
    
}
