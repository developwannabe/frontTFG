function ControlWeb() {
    this.init = function () {
        $("#au").empty();
        if ($.cookie("email") == undefined) {
            $("#au").load("./clnt/login.html", function () {
                $("#iniSesion").click(function () {
                    event.preventDefault();
                    var user = $("#email").val();
                    var pass = $("#password").val();
                    let res = comprobarDatos(user,pass)
                    if( res == null){
                        cr.iniciarSesion(user, pass);
                    }else{
                        cw.errorDatosLogin(res);
                    }
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
                $("#usersButton").click(function () {
                    cw.gestionarUsuarios();
                });
            });
        }
    };

    this.errorDatosLogin = function (error) {
        let mensaje;
        switch (error) {
            case -1:
                mensaje = "El email no es válido";
                break;
            case -2:
                mensaje = "Debes rellenar todos los campos";
                break;
        }
        cw.errorLogin(mensaje);
    };

    this.errorLoginRest = function (error) {
        let mensaje;
        switch (error) {
            case -1:
                mensaje = "El email no es válido";
                break;
            case -2:
                mensaje = "Debes rellenar todos los campos";
                break;
            case -3:
                mensaje = "El usuario no existe";
                break;
            case -4:
                mensaje = "La contraseña no es correcta";
                break;
        }
        cw.errorLogin(mensaje);
    };

    this.errorLogin = function(mensaje){
        $("#errorLogin").empty();
        $("#errorLogin").append(`
        <div class="animate__animated animate__pulse flex items-center p-4 mb-4 text-sm text-red-800 rounded-lg bg-red-50 dark:bg-gray-800 dark:text-red-400" role="alert">
            <svg class="flex-shrink-0 inline w-4 h-4 me-3" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 20 20">
              <path d="M10 .5a9.5 9.5 0 1 0 9.5 9.5A9.51 9.51 0 0 0 10 .5ZM9.5 4a1.5 1.5 0 1 1 0 3 1.5 1.5 0 0 1 0-3ZM12 15H8a1 1 0 0 1 0-2h1v-3H8a1 1 0 0 1 0-2h2a1 1 0 0 1 1 1v4h1a1 1 0 0 1 0 2Z"/>
            </svg>
            <span class="sr-only">Info</span>
            <div>
                ${mensaje}
            </div>
        </div>
        `);
    }


    const comprobarDatos = function (email,password) {
        if (email !== "" && password !== "") {
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(email)) {
                return -1;
            }
            return null;
        } else {
            return -2;
        }
    };

    this.gestionarUsuarios = function () {
        $("#centerContent").empty();
        $("#centerContent").load("./clnt/usuarios.html", function () {
            obtenerUsuarios("");
            $("#table-search").on(
                "input",
                debounce(() => obtenerUsuarios($("#table-search").val()), 300)
            );
            $("#añadirUsuario").click(function () {
                registrarUsuario();
            });
        });
    };

    function debounce(func, wait) {
        let timeout;
        return function (...args) {
            clearTimeout(timeout);
            timeout = setTimeout(() => func.apply(this, args), wait);
        };
    }

    function registrarUsuario() {
        $("#modal").empty();
        $("#modal").append(`
        <div class="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
            <div class="relative p-4 w-full max-w-md max-h-full">
                <!-- Modal content -->
                <div class="relative bg-white rounded-lg shadow dark:bg-gray-700">
                    <!-- Modal header -->
                    <div class="flex items-center justify-between p-4 md:p-5 border-b rounded-t dark:border-gray-600">
                        <h3 class="text-xl font-semibold text-gray-900 dark:text-white">
                            Nuevo Usuario
                        </h3>
                        <button id="closeButton" type="button" class="end-2.5 text-gray-400 bg-transparent hover:bg-gray-200 hover:text-gray-900 rounded-lg text-sm w-8 h-8 ms-auto inline-flex justify-center items-center dark:hover:bg-gray-600 dark:hover:text-white" data-modal-hide="authentication-modal">
                            <svg class="w-3 h-3" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 14 14">
                                <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="m1 1 6 6m0 0 6 6M7 7l6-6M7 7l-6 6"/>
                            </svg>
                            <span class="sr-only">Close modal</span>
                        </button>
                    </div>
                    <!-- Modal body -->
                    <div class="p-4 md:p-5">
                        <form class="space-y-4" action="#">
                        <div>
                            <label for="nombreUsuario" class="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Nombre</label>
                            <input type="text" id="nombreUsuario" class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500" placeholder="Pepe" required />
                        </div>
                        <div>
                            <label for="apellidosUsuario" class="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Apellidos</label>
                            <input type="text" id="apellidosUsuario" class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500" placeholder="Viyuela" required />
                        </div>
                        <div class="mb-6">
                            <label for="emailUser" class="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Email</label>
                            <input type="email" id="emailUser" class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500" placeholder="pepe.viyuela@its.com" required />
                        </div> 
                        <label for="roles" class="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Rol</label>
                        <select id="roles" class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500">
                          <option value="admin">Administración</option>
                          <option value="evaluador">Equipo Evaluador</option>
                          <option value="personal">Personal de Emergencias</option>
                        </select>
                        <div>
                            <label for="password" class="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Cambiar contraseña:</label>
                            <input id="passwordUsuario" type="password" name="password" id="password" placeholder="••••••••" class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-600 dark:border-gray-500 dark:placeholder-gray-400 dark:text-white" required />
                        </div>   
                        <button disabled id="crearButton" type="submit" class="w-full text-white bg-gray-400 hover:bg-gray-500 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800 cursor-not-allowed" disabled>Registrar Usuario</button>
                        </button>
                        </form>
                    </div>
                </div>
            </div>
        </div>
        `);
        $("#closeButton").click(function () {
            $("#modal").hide();
        });

        $(
            "#nombreUsuario, #apellidosUsuario, #emailUsuario, #passwordUsuario, #roles, #emailUser"
        ).on("input", function () {
            const nombreActual = $("#nombreUsuario").val();
            const apellidosActual = $("#apellidosUsuario").val();
            const passwordActual = $("#passwordUsuario").val();
            const emailActual = $("#emailUser").val();
            const rolActual = $("#roles").val();

            if (
                nombreActual !== "" &&
                apellidosActual !== "" &&
                passwordActual !== "" &&
                rolActual !== "" &&
                emailActual !== ""
            ) {
                $("#crearButton")
                    .prop("disabled", false)
                    .removeClass(
                        "cursor-not-allowed bg-gray-400 hover:bg-gray-500"
                    )
                    .addClass("bg-blue-600 hover:bg-blue-700");
            } else {
                $("#crearButton")
                    .prop("disabled", true)
                    .addClass(
                        "cursor-not-allowed bg-gray-400 hover:bg-gray-500"
                    )
                    .removeClass("bg-blue-600 hover:bg-blue-700");
            }
        });

        $("#crearButton").click(function (event) {
            event.preventDefault();
            let datos = {};
            if ($("#passwordUsuario").val() !== "") {
                datos["password"] = $("#passwordUsuario").val();
            }
            if ($("#nombreUsuario").val() !== "") {
                datos["nombre"] = $("#nombreUsuario").val();
            }
            if ($("#apellidosUsuario").val() !== "") {
                datos["apellidos"] = $("#apellidosUsuario").val();
            }
            if ($("#roles").val() !== "") {
                datos["rol"] = $("#roles").val();
            }
            if ($("#emailUser").val() !== "") {
                datos["email"] = $("#emailUser").val();
            }
            cr.registrarUsuario(datos, $.cookie("tkn"), function () {
                obtenerUsuarios("");
                $("#modal").hide();
            });
        });
        $("#modal").show();
    }

    function obtenerUsuarios(query) {
        cr.buscarUsuarios(query, $.cookie("tkn"), function (data) {
            $("#datosUsuarios").empty();
            let cont = 0;
            data.forEach((usuario) => {
                let rolUser;
                switch (usuario.rol) {
                    case "admin":
                        rolUser = "Administración";
                        break;
                    case "evaluador":
                        rolUser = "Equipo Evaluador";
                        break;
                    case "personal":
                        rolUser = "Personal de Emergencias";
                        break;
                }
                $("#datosUsuarios")
                    .append(`<tr class="bg-white dark:bg-gray-800">
                        <th scope="row" class="px-6 py-4 font-medium text-gray-900 whitespace-nowrap dark:text-white">
                            ${usuario.nombre}
                        </th>
                        <td class="px-6 py-4">
                            ${usuario.apellidos}
                        </td>
                        <td class="px-6 py-4">
                            ${usuario.email}
                        </td>
                        <td class="px-6 py-4">
                            ${rolUser}
                        </td>
                        <td class="flex py-4 gap-4">
                            <button id="edit-${cont}" class="font-medium text-blue-600 dark:text-blue-500 hover:underline">Editar</button>
                            <button id="remove-${cont}" href="#" class="font-medium text-red-600 dark:text-blue-500 hover:underline">Eliminar</button>
                        </td>
                    </tr>
            `);
                $(`#edit-${cont}`).click(function () {
                    cw.editarUsuario(usuario);
                });
                $(`#remove-${cont}`).click(function () {
                    cw.eliminarUsuario(usuario);
                });
                cont++;
            });
        });
    }

    this.editarUsuario = function (usuario) {
        $("#modal").empty();
        $("#modal").append(`
        <div class="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
            <div class="relative p-4 w-full max-w-md max-h-full">
                <!-- Modal content -->
                <div class="relative bg-white rounded-lg shadow dark:bg-gray-700">
                    <!-- Modal header -->
                    <div class="flex items-center justify-between p-4 md:p-5 border-b rounded-t dark:border-gray-600">
                        <h3 class="text-xl font-semibold text-gray-900 dark:text-white">
                            Editar Usuario
                        </h3>
                        <button id="closeButton" type="button" class="end-2.5 text-gray-400 bg-transparent hover:bg-gray-200 hover:text-gray-900 rounded-lg text-sm w-8 h-8 ms-auto inline-flex justify-center items-center dark:hover:bg-gray-600 dark:hover:text-white" data-modal-hide="authentication-modal">
                            <svg class="w-3 h-3" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 14 14">
                                <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="m1 1 6 6m0 0 6 6M7 7l6-6M7 7l-6 6"/>
                            </svg>
                            <span class="sr-only">Close modal</span>
                        </button>
                    </div>
                    <!-- Modal body -->
                    <div class="p-4 md:p-5">
                        <form class="space-y-4" action="#">
                        <div>
                            <label for="nombreUsuario" class="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Nombre</label>
                            <input type="text" id="nombreUsuario" class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500" placeholder="Pepe" required />
                        </div>
                        <div>
                            <label for="apellidosUsuario" class="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Apellidos</label>
                            <input type="text" id="apellidosUsuario" class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500" placeholder="Viyuela" required />
                        </div>
                        <div>
                            <label
                                for="emailUsuario"
                                class="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
                                >Correo electrónico</label
                            >
                            <input type="text" id="emailUsuario" aria-label="disabled input" class="mb-6 bg-gray-100 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 cursor-not-allowed dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-gray-400 dark:focus:ring-blue-500 dark:focus:border-blue-500" value="Disabled sinput" disabled>
                        </div>
                        <label for="roles" class="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Rol</label>
                        <select id="roles" class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500">
                          <option value="admin">Administración</option>
                          <option value="evaluador">Equipo Evaluador</option>
                          <option value="personal">Personal de Emergencias</option>
                        </select>
                        <div>
                            <label for="password" class="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Cambiar contraseña:</label>
                            <input id="passwordUsuario" type="password" name="password" id="password" placeholder="••••••••" class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-600 dark:border-gray-500 dark:placeholder-gray-400 dark:text-white" required />
                        </div>   
                        <button disabled id="modifyButton" type="submit" class="w-full text-white bg-gray-400 hover:bg-gray-500 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800 cursor-not-allowed" disabled>Editar Usuario</button>
                        </button>
                        </form>
                    </div>
                </div>
            </div>
        </div>
        `);
        $("#roles").val(usuario.rol);
        $("#nombreUsuario").val(usuario.nombre);
        $("#apellidosUsuario").val(usuario.apellidos);
        $("#emailUsuario").val(usuario.email);
        $("#closeButton").click(function () {
            $("#modal").hide();
        });

        $(
            "#nombreUsuario, #apellidosUsuario, #emailUsuario, #passwordUsuario, #roles"
        ).on("input", function () {
            const nombreActual = $("#nombreUsuario").val();
            const apellidosActual = $("#apellidosUsuario").val();
            const passwordActual = $("#passwordUsuario").val();
            const rolActual = $("#roles").val();

            if (
                nombreActual !== usuario.nombre ||
                apellidosActual !== usuario.apellidos ||
                passwordActual !== "" ||
                rolActual !== usuario.rol
            ) {
                $("#modifyButton")
                    .prop("disabled", false)
                    .removeClass(
                        "cursor-not-allowed bg-gray-400 hover:bg-gray-500"
                    )
                    .addClass("bg-blue-600 hover:bg-blue-700");
            } else {
                $("#modifyButton")
                    .prop("disabled", true)
                    .addClass(
                        "cursor-not-allowed bg-gray-400 hover:bg-gray-500"
                    )
                    .removeClass("bg-blue-600 hover:bg-blue-700");
            }
        });

        $("#modifyButton").click(function (event) {
            event.preventDefault();
            let datos = {};
            if ($("#passwordUsuario").val() !== "") {
                datos["password"] = $("#passwordUsuario").val();
            }
            if ($("#nombreUsuario").val() !== usuario.nombre) {
                datos["nombre"] = $("#nombreUsuario").val();
            }
            if ($("#apellidosUsuario").val() !== usuario.apellidos) {
                datos["apellidos"] = $("#apellidosUsuario").val();
            }
            if ($("#roles").val() !== usuario.rol) {
                datos["rol"] = $("#roles").val();
            }
            let data = { email: usuario.email, datos: datos };
            cr.editarUsuario(data, $.cookie("tkn"), function () {
                obtenerUsuarios("");
                $("#modal").hide();
            });
        });
        $("#modal").show();
    };

    this.eliminarUsuario = function (usuario) {
        $("#modal").empty();
        $("#modal").append(`
        <div class="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
            <div class="relative p-4 w-full max-w-md max-h-full">
                <div class="relative bg-white rounded-lg shadow dark:bg-gray-700">
                    <button id="closeButton" type="button" class="absolute top-3 right-2.5 text-gray-400 bg-transparent hover:bg-gray-200 hover:text-gray-900 rounded-lg text-sm w-8 h-8 ms-auto inline-flex justify-center items-center dark:hover:bg-gray-600 dark:hover:text-white" data-modal-hide="popup-modal">
                        <svg class="w-3 h-3" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 14 14">
                            <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="m1 1 6 6m0 0 6 6M7 7l6-6M7 7l-6 6"/>
                        </svg>
                        <span class="sr-only">Close modal</span>
                    </button>
                    <div class="p-4 md:p-5 text-center">
                        <svg class="mx-auto mb-4 text-gray-400 w-12 h-12 dark:text-gray-200" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 20 20">
                            <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 11V6m0 8h.01M19 10a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"/>
                        </svg>
                        <h3 class=" text-lg font-normal text-gray-500 dark:text-gray-400">¿Deseas eliminar el usuario del sistema?</h3>
                        <p class="text-sm text-gray-400 dark:text-gray-300 mb-5">Esta acción no se puede deshacer.</p>
                        <button id="deleteButton" data-modal-hide="popup-modal" type="button" class="text-white bg-red-600 hover:bg-red-800 focus:ring-4 focus:outline-none focus:ring-red-300 dark:focus:ring-red-800 font-medium rounded-lg text-sm inline-flex items-center px-5 py-2.5 text-center">
                            Sí, eliminar
                        </button>
                        <button id="cancelButton" data-modal-hide="modal" type="button" class="py-2.5 px-5 ms-3 text-sm font-medium text-gray-900 focus:outline-none bg-white rounded-lg border border-gray-200 hover:bg-gray-100 hover:text-blue-700 focus:z-10 focus:ring-4 focus:ring-gray-100 dark:focus:ring-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:border-gray-600 dark:hover:text-white dark:hover:bg-gray-700">No, cancelar</button>
                    </div>
                </div>
            </div>
        </div>
    `);
        $("#modal").show();
        $("#deleteButton").click(function () {
            cr.eliminarUsuario(usuario.email, $.cookie("tkn"), function () {
                obtenerUsuarios("");
                $("#modal").hide();
            });
        });
        $("#cancelButton").click(function () {
            $("#modal").hide();
        });
        $("#closeButton").click(function () {
            $("#modal").hide();
        });
    };
    this.toggleSubmenu = function (id) {
        var submenu = document.getElementById(id);
        if (submenu.classList.contains("hidden")) {
            submenu.classList.remove("hidden");
        } else {
            submenu.classList.add("hidden");
        }
    };
}
