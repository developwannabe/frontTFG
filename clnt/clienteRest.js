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

    this.eliminarUsuario = function(email, tkn, callback){
        $.ajax({
            type: "DELETE",
            url: this.url + "/usuario",
            data: JSON.stringify({ email: email}),
            headers: {
                'Authorization': 'Bearer ' + tkn
            },
            success: function (data) {
                callback();
            },
            error: function (xhr, textStatus, errorThrown) {
                console.log("Status: " + textStatus);
                console.log("Error: " + errorThrown);
            },
            contentType: "application/json",
        });
    }

    this.editarUsuario = function(datos, tkn, callback){
        $.ajax({
            type: "PATCH",
            url: this.url + "/usuario",
            data: JSON.stringify(datos),
            headers: {
                'Authorization': 'Bearer ' + tkn
            },
            success: function (data) {
                callback(data.error);
            },
            error: function (xhr, textStatus, errorThrown) {
                console.log("Status: " + textStatus);
                console.log("Error: " + errorThrown);
            },
            contentType: "application/json",
        });
    }
    
    this.obtenerTransiciones = function (tkn, callback){
        $.ajax({
            type: "GET",
            url: this.url + "/transiciones",
            headers: {
                'Authorization': 'Bearer ' + tkn
            },
            success: function (data) {
                callback(data);
            },
            error: function (xhr, textStatus, errorThrown) {
                console.log("Status: " + textStatus);
                console.log("Error: " + errorThrown);
            },
            contentType: "application/json",
        });
    }

    this.iniciarEvaluacion = function (tkn, evalSession, callback){
        if(!evalSession){
            evalSession = 0;
        }
        $.ajax({
            type: "GET",
            url: this.url + "/iniciarEvaluacion/"+evalSession,
            headers: {
                'Authorization': 'Bearer ' + tkn
            },
            success: function (data) {
                $.cookie("evalSession", data.id);
                callback(data);
            },
            error: function (xhr, textStatus, errorThrown) {
                console.log("Status: " + textStatus);
                console.log("Error: " + errorThrown);
            },
            contentType: "application/json",
        });
    };

    this.evaluarTransicion = function (tkn, evalSession, transicion, callback){
        $.ajax({
            type: "GET",
            url: this.url + "/evalImage/"+evalSession+"/"+transicion,
            headers: {
                'Authorization': 'Bearer ' + tkn
            },
            success: function (data) {
                callback(data.GPT);
            },
            error: function (xhr, textStatus, errorThrown) {
                console.log("Status: " + textStatus);
                console.log("Error: " + errorThrown);
            },
            contentType: "application/json",
        });
    };

    this.iniciarSesion = function (email, password,callback) {
        $.ajax({
            type: "POST",
            url: this.url + "/iniciarSesion",
            data: JSON.stringify({ email: email, password: password }),
            success: function (data) {
                if (data.email && data.tkn && data.rol) {
                    $.cookie("email", data.email);
                    $.cookie("tkn", data.tkn);
                    $.cookie("rol", data.rol);
                    location.reload();
                } else {
                    if(data.error){
                        callback(data.error);
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

    this.registrarUsuario = function(datos, tkn, callback){
        $.ajax({
            type: "POST",
            url: this.url + "/registrarUsuario",
            data: JSON.stringify(datos),
            headers: {
                'Authorization': 'Bearer ' + tkn
            },
            success: function (data) {
                callback(data.error);
            },
            error: function (xhr, textStatus, errorThrown) {
                console.log("Status: " + textStatus);
                console.log("Error: " + errorThrown);
            },
            contentType: "application/json",
        });
    }
}