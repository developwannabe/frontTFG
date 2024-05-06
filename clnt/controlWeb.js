function ControlWeb() {
    this.init = function () {
        $("#au").empty();
        if ($.cookie("email") == undefined) {
            $("#au").load("./clnt/login.html", function () {
                $("#iniSesion").click(function () {
                    event.preventDefault();
                    var user = $("#email").val();
                    var pass = $("#password").val();
                    cr.iniciarSesion(user, pass);
                });
            });
        } else {
            $("#au").load("./clnt/menu.html", function () {
                $("#cerrarSesion").click(function () {
                    event.preventDefault();
                    $.removeCookie("email");
                    $.removeCookie("tkn");
                    location.reload();
                });
            });
        }
    };
}
