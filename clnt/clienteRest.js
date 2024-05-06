function ClienteRest(){
    this.url = 'http://localhost:3000';

    this.iniciarSesion = function (email, password) {
        console.log(email, password)
        $.ajax({
            type: "POST",
            url: this.url + "/iniciarSesion",
            data: JSON.stringify({ email: email, password: password }),
            success: function (data) {
                console.log(data)
                if (data.email && data.tkn) {
                    $.cookie("email", data.email);
                    $.cookie("tkn", data.tkn);
                    location.reload();
                } else {
                    switch (data.error) {
                        case -1:
                            cw.mostrarMsgForm(
                                "Las credenciales introducidas son incorrectas.",
                                "error"
                            );
                            break;
                        case -2:
                            cw.reenviarCorreo(email);
                            break;
                    }
                }
            },
            error: function (xhr, textStatus, errorThrown) {
                console.log("Status: " + textStatus);
                console.log("Error: " + errorThrown);
            },
            contentType: "application/json",
        });
    };
}