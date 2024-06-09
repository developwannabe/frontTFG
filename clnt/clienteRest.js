function ClienteRest() {
    if (window.location.hostname === "localhost") {
        this.url = "http://localhost:3000";
    } else {
        this.url = "https://backtfg-iwr6ji5k5a-ew.a.run.app";
    }

    this.ping = function (callback) {
        $.ajax({
            type: "GET",
            url: this.url + "/ping",
            success: function () {
                callback();
            },
            error: function (xhr, textStatus, errorThrown) {
                console.log("Status: " + textStatus);
                console.log("Error: " + errorThrown);
            },
            contentType: "application/json",
        });
    };

    this.buscarUsuarios = function (input, tkn, callback) {
        $.ajax({
            type: "POST",
            url: this.url + "/buscarUsuarios",
            data: JSON.stringify({ input: input }),
            headers: {
                Authorization: "Bearer " + tkn,
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
    };

    this.eliminarUsuario = function (email, tkn, callback) {
        $.ajax({
            type: "DELETE",
            url: this.url + "/usuario",
            data: JSON.stringify({ email: email }),
            headers: {
                Authorization: "Bearer " + tkn,
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
    };

    this.editarUsuario = function (datos, tkn, callback) {
        $.ajax({
            type: "PATCH",
            url: this.url + "/usuario",
            data: JSON.stringify(datos),
            headers: {
                Authorization: "Bearer " + tkn,
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
    };

    this.obtenerTransiciones = function (tkn, callback) {
        $.ajax({
            type: "GET",
            url: this.url + "/transiciones",
            headers: {
                Authorization: "Bearer " + tkn,
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
    };

    this.iniciarEvaluacion = function (tkn, evalSession, callback) {
        if (!evalSession) {
            evalSession = 0;
        }
        $.ajax({
            type: "GET",
            url: this.url + "/iniciarEvaluacion/" + evalSession,
            headers: {
                Authorization: "Bearer " + tkn,
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

    this.obtenerEvaluacion = function (tkn, evalSession, callback) {
        $.ajax({
            type: "GET",
            url: this.url + "/evaluacionRes/" + evalSession,
            headers: {
                Authorization: "Bearer " + tkn,
            },
            success: function (data) {
                callback(data.result);
            },
            error: function (xhr, textStatus, errorThrown) {
                console.log("Status: " + textStatus);
                console.log("Error: " + errorThrown);
            },
            contentType: "application/json",
        });
    };

    this.finalizarEvaluacion = function (tkn, evalSession, callback) {
        $.ajax({
            type: "GET",
            url: this.url + "/finalizarEvaluacion/" + evalSession,
            headers: {
                Authorization: "Bearer " + tkn,
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
    };

    this.obtenerEvaluaciones = function (tkn, callback) {
        $.ajax({
            type: "GET",
            url: this.url + "/evaluaciones",
            headers: {
                Authorization: "Bearer " + tkn,
            },
            success: function (data) {
                callback(data.evaluaciones);
            },
            error: function (xhr, textStatus, errorThrown) {
                console.log("Status: " + textStatus);
                console.log("Error: " + errorThrown);
            },
            contentType: "application/json",
        });
    };

    this.evaluarTransicion = function (
        tkn,
        evalSession,
        transicion,
        boole,
        callback
    ) {
        $.ajax({
            type: "GET",
            url: this.url + "/evalImage/" + evalSession + "/" + transicion,
            headers: {
                Authorization: "Bearer " + tkn,
            },
            success: function (data) {
                if (!boole) {
                    cw.evaluacionRecibida(transicion, data);
                }
                callback(data.GPT, data.flood, data.objects);
            },
            error: function (xhr, textStatus, errorThrown) {
                console.log("Status: " + textStatus);
                console.log("Error: " + errorThrown);
            },
            contentType: "application/json",
        });
    };

    this.iniciarSesion = function (email, password, callback) {
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
                    if (data.error) {
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

    this.fisTransiciones = function (tkn, idSession, callback) {
        $.ajax({
            type: "GET",
            url: this.url + "/fisTransiciones/" + idSession,
            headers: {
                Authorization: "Bearer " + tkn,
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
    };

    this.transitabilidadTransicion = function (
        tkn,
        idSession,
        transicion,
        valor,
        callback
    ) {
        $.ajax({
            type: "GET",
            url:
                this.url +
                "/transitabilidad/" +
                idSession +
                "/" +
                transicion +
                "/" +
                valor,
            headers: {
                Authorization: "Bearer " + tkn,
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
    };
    this.enviarEvaluacion = function (
        tkn,
        session,
        transition,
        flood,
        objects,
        callback
    ) {
        let datos = {
            id: session,
            transition: transition,
            flood: flood,
            objects: objects,
        };
        $.ajax({
            type: "POST",
            url: this.url + "/evaluarTransicion",
            data: JSON.stringify(datos),
            headers: {
                Authorization: "Bearer " + tkn,
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
    };

    this.registrarUsuario = function (datos, tkn, callback) {
        $.ajax({
            type: "POST",
            url: this.url + "/registrarUsuario",
            data: JSON.stringify(datos),
            headers: {
                Authorization: "Bearer " + tkn,
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
    };

    this.evaluacion = function (tkn, id, callback) {
        $.ajax({
            type: "GET",
            url: this.url + "/evaluacionRes/" + id,
            headers: {
                Authorization: "Bearer " + tkn,
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
    };

    this.obtenerLugares = function (tkn, callback) {
        $.ajax({
            type: "GET",
            url: this.url + "/lugares",
            headers: {
                Authorization: "Bearer " + tkn,
            },
            success: function (data) {
                callback(data.lugares);
            },
            error: function (xhr, textStatus, errorThrown) {
                console.log("Status: " + textStatus);
                console.log("Error: " + errorThrown);
            },
        });
    };

    this.solicitarRuta = function (tkn, origen, destino, callback) {
        $.ajax({
            type: "GET",
            url: this.url + "/ruta/" + origen + "/" + destino,
            headers: {
                Authorization: "Bearer " + tkn,
            },
            success: function (data) {
                callback(data);
            },
            error: function (xhr, textStatus, errorThrown) {
                console.log("Status: " + textStatus);
                console.log("Error: " + errorThrown);
            },
        });
    };
}
