function ClienteRest(){

    if (window.location.hostname === "localhost") {
        this.url = 'http://localhost:3000';
    } else {
        this.url = "https://backtfg-iwr6ji5k5a-ew.a.run.app";
    }

    this.buscarUsuarios = function (input, tkn, callback) {
        $.ajax({
            type: "POST",
            url: this.url + "/buscarUsuarios",
            data: JSON.stringify({ input: input}),
            headers: {
                'Authorization': 'Bearer ' + tkn
            },
            success: function (data) {
                callback(data.usuarios);
            },
            error: function (xhr, textStatus, errorThrown) {
                console.log("Status: " + textStatus);
                console.log("Error: " + errorThrown);
            },
            contentType: "application/json",
        });
    }
    
    this.iniciarSesion = function (email, password) {
        $.ajax({
            type: "POST",
            url: this.url + "/iniciarSesion",
            data: JSON.stringify({ email: email, password: password }),
            success: function (data) {
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