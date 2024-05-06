function ControlWeb(){
    this.init = function(){
        $("#au").empty();
        $("#au").load("./clnt/login.html",function(){
            console.log("R");
            $("#iniSesion").click(function(){
                event.preventDefault();
                var user = $("#email").val();
                var pass = $("#password").val();
                cr.iniciarSesion(user, pass);
            })
        });

    }
}