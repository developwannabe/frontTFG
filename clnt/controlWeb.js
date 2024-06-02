function ControlWeb() {
    this.init = function () {
        $("#au").empty();
        if ($.cookie("email") == undefined) {
            $("#au").load("./clnt/login.html", function () {
                $("#iniSesion").click(function () {
                    event.preventDefault();
                    var user = $("#email").val();
                    var pass = $("#password").val();
                    let res = comprobarDatos(user, pass);
                    if (res == null) {
                        cr.iniciarSesion(user, pass, function (error) {
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
                        });
                    } else {
                        let mensaje;
                        switch (res) {
                            case -1:
                                mensaje = "El email no es válido";
                                break;
                            case -2:
                                mensaje = "Debes rellenar todos los campos";
                                break;
                        }
                        cw.errorLogin(mensaje);
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
                $("#newEvalButton").click(function () {
                    cw.evaluar();
                });
                $("#oldEvalButton").click(function () {
                    cw.evaluacionesAnteriores();
                });
            });
        }
    };

    this.evaluacionesAnteriores = function () {
        $("#centerContent").load(
            "./clnt/evalOld/evaluaciones.html",
            function () {
                cr.obtenerEvaluaciones($.cookie("tkn"), function (res) {
                    let date;
                    if (res.length > 0) {
                        $("#datosOldEval").empty();
                        for (let i = 0; i < res.length; i++) {
                            date = new Date(res[i].id);
                            const day = date
                                .getDate()
                                .toString()
                                .padStart(2, "0");
                            const month = (date.getMonth() + 1)
                                .toString()
                                .padStart(2, "0");
                            const year = date.getFullYear();
                            const hours = date
                                .getHours()
                                .toString()
                                .padStart(2, "0");
                            const minutes = date
                                .getMinutes()
                                .toString()
                                .padStart(2, "0");
                            $("#datosOldEval").append(`
                        <tr class="bg-white dark:bg-gray-800">
                        <th scope="row" class="px-6 py-4 font-medium text-gray-900 whitespace-nowrap dark:text-white">
                            ${day}/${month}/${year} ${hours}:${minutes}
                        </th>
                        <td class="px-6 py-4">
                            ${res[i].evaluador}
                        </td>
                        <td class="flex py-4 gap-4">
                            <button id="ver-${res[i].id}" class="font-medium text-blue-600 dark:text-blue-500 hover:underline">Ver Evaluación</button>
                        </td>
                    </tr>`);
                            $(`#ver-${res[i].id}`).click(function () {
                                cw.verEvaluacion(res[i].id);
                            });
                        }
                    } else {
                        $("#tablaOldEval").hide();
                        cw.mostrarAlert("No hay evaluaciones anteriores");
                    }
                });
            }
        );
    };

    this.verEvaluacion = function (id) {
        $("#centerContent").empty();
        $("#centerContent").load("./clnt/evalOld/evaluacion.html", function () {
            $("#volverAtras").click(function () {
                cw.evaluacionesAnteriores();
            });
            cr.evaluacion($.cookie("tkn"), id, function (datos) {
                let keys = Object.keys(datos.result.evaluacion);
                let data = [];
                $("#magnitudTerremoto").append(`
                <div class="flex flex-col">
                <div class="flex flex-row items-center"><h3 class="font-semibold text-gray-900 dark:text-white p-1">Evaluación realizada por: </h3>${datos.result.user}</div>
                <div><h3 class="font-semibold text-gray-900 dark:text-white p-1">Magnitud del Terremoto: ${datos.result.magnitude}</h3></div>
                </div>
            `);
                for (let i = 0; i < keys.length; i++) {
                    data.push({
                        id: keys[i].slice(5),
                        flood: datos.result.evaluacion[keys[i]].flood,
                        objects: datos.result.evaluacion[keys[i]].objects,
                        fis: datos.result.evaluacion[keys[i]].fis,
                        transitabilidad:
                            datos.result.evaluacion[keys[i]].transitabilidad,
                    });
                }
                for (let i = 0; i < keys.length; i++) {
                    $("#spinner").addClass("hidden");
                    $("#dtarjetaEval").removeClass("hidden");
                    cw.tarjetaEval({
                        transicion: keys[i].slice(5),
                        flood: data[i].flood,
                        objects: data[i].objects,
                        floodGPT: datos.result.evaluacion[keys[i]].gpt.flood,
                        objectsGPT:
                            datos.result.evaluacion[keys[i]].gpt.objects,
                        sessionId: id,
                    });
                    $("div.barraEval").remove();
                    $("div.botonEnviarT").empty();
                    $(`#evalF${keys[i].slice(5)}`).append(`
                            <span class="font-semibold text-gray-900 dark:text-white">Evaluación</span>
                            <span class="text-gray-500 dark:text-gray-400">Flood: ${
                                datos.result.evaluacion[keys[i]].flood
                            }</span>
                            <span class="text-gray-500 dark:text-gray-400">Objetos: ${
                                datos.result.evaluacion[keys[i]].objects
                            }</span>
                            `);
                    $(`#evalF${keys[i].slice(5)}`).removeClass("hidden");
                    $(`#barraTransitabilidad${keys[i].slice(5)}`).append(`
                            <div class="flex flex-col gap-2">
                            <span class="font-semibold text-gray-900 dark:text-white">Transitabilidad</span>
                            <div>
                                <span class="font-semibold text-gray-900 dark:text-white">Recomendación: </span>${
                                    datos.result.evaluacion[keys[i]].fis
                                }    
                            </div>
                            <div>
                                <span class="font-semibold text-gray-900 dark:text-white">Elección: </span> ${
                                    datos.result.evaluacion[keys[i]]
                                        .transitabilidad
                                }   
                            </div>
                        `);
                    $("#tarjeta" + keys[0].slice(5)).removeClass("hidden");
                    cw.evaluacionRecibida(
                        keys[i].slice(5),
                        datos.result.evaluacion[keys[i]]
                    );
                }
                cw.tablaTransicionesT(data, function () {
                    for (let i = 0; i < keys.length; i++) {
                        $(`#valor${keys[i].slice(5)}`).empty();
                        $(`#valor${keys[i].slice(5)}`).append(datos.result.evaluacion[keys[i]].flood + " / " + datos.result.evaluacion[keys[i]].objects);
                        $(`#estado${keys[i].slice(5)}`).empty();
                        $(`#estado${keys[i].slice(5)}`).append(datos.result.evaluacion[keys[i]].transitabilidad);
                    }
                });
            });
        });
    };

    this.evaluar = function () {
        $("#centerContent").load("./clnt/eval/eval1.html", function () {
            $("#startEval").click(function () {
                if ($.cookie("evalSession") == undefined) {
                    cr.iniciarEvaluacion(
                        $.cookie("tkn"),
                        $.cookie("evalSession"),
                        function (data) {
                            cw.evaluar2(data.transiciones, data.magnitude);
                        }
                    );
                } else {
                    cw.evaluacionEnCurso();
                }
            });
        });
    };

    this.evaluacionEnCurso = function () {
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
                        <h3 class=" text-lg font-normal text-gray-500 dark:text-gray-400">¿Deseas reanudar la evaluación en curso?</h3>
                        <p class="text-sm text-gray-400 dark:text-gray-300 mb-5">Perderás tu progreso si comienzas una nueva evaluación.</p>
                        <div class ="flex flex-row items-center justify-between">
                        <button id="reanudarButton" data-modal-hide="modal" type="button" class="py-2.5 px-5 ms-3 text-sm font-medium text-gray-900 focus:outline-none bg-white rounded-lg border border-gray-200 hover:bg-gray-100 hover:text-blue-700 focus:z-10 focus:ring-4 focus:ring-gray-100 dark:focus:ring-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:border-gray-600 dark:hover:text-white dark:hover:bg-gray-700">Reanudar Evaluación</button>
                        <button id="nuevaButton" data-modal-hide="popup-modal" type="button" class="text-white bg-red-600 hover:bg-red-800 focus:ring-4 focus:outline-none focus:ring-red-300 dark:focus:ring-red-800 font-medium rounded-lg text-sm inline-flex items-center px-5 py-2.5 text-center">
                            Nueva Evaluación
                        </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `);
        $("#modal").show();
        $("#reanudarButton").click(function () {
            cr.iniciarEvaluacion(
                $.cookie("tkn"),
                $.cookie("evalSession"),
                function (data) {
                    cw.evaluar2(data.transiciones, data.magnitude);
                    $("#modal").hide();
                }
            );
        });
        $("#nuevaButton").click(function () {
            $.removeCookie("evalSession");
            cr.iniciarEvaluacion(
                $.cookie("tkn"),
                $.cookie("evalSession"),
                function (data) {
                    cw.evaluar2(data.transiciones, data.magnitude);
                    $("#modal").hide();
                }
            );
        });
        $("#closeButton").click(function () {
            $("#modal").hide();
        });
    };

    this.evaluar2 = function (data, magnitude) {
        let tran = [];
        data.forEach((element) => {
            tran.push(element.replace("info4", ""));
        });
        $("#centerContent").load("./clnt/eval/eval2.html", function () {
            $("#magnitudTerremoto").append(`
            <h3 class="font-semibold text-gray-900 dark:text-white p-1">Magnitud del Terremoto: ${magnitude}</h3>
            `);
            $("#evaluarTransitabilidad").click(function () {
                cw.evaluar3(tran);
            });
            cw.tablaTransiciones(tran, function () {
                cr.evaluarTransicion(
                    $.cookie("tkn"),
                    $.cookie("evalSession"),
                    tran[0],
                    false,
                    async function (trn, flood, objects) {
                        cw.tarjetaEval({
                            transicion: tran[0],
                            flood: flood,
                            objects: objects,
                            floodGPT: trn.flood,
                            objectsGPT: trn.objects,
                            sessionId: $.cookie("evalSession"),
                        });
                        $(`#tarjeta${tran[0]}`).removeClass("hidden");
                        for (let i = 1; i < tran.length; i++) {
                            cr.evaluarTransicion(
                                $.cookie("tkn"),
                                $.cookie("evalSession"),
                                tran[i],
                                false,
                                function (trn2, flood2, objects2) {
                                    cw.tarjetaEval({
                                        transicion: tran[i],
                                        flood: flood2,
                                        objects: objects2,
                                        floodGPT: trn2.flood,
                                        objectsGPT: trn2.objects,
                                        sessionId: $.cookie("evalSession"),
                                    });
                                }
                            );
                        }
                    }
                );
            });
        });
    };

    this.evaluar3 = async function (transiciones) {
        const result = await comprobarEval(transiciones);
        $(`#buttonNext`).hide();
        if (result) {
            $("#dtarjetaEval").hide();
            $("#tablaEvaluacioness").hide();
            $("#tabMedio").text("Evaluación");
            $("#spinner").removeClass("hidden");
            $("#tablaTransiciones").empty();
            $("#tablaTransiciones").append(`
            <tr
                            class="bg-white border-b dark:bg-gray-800 dark:border-gray-700"
                        >
                            <th
                                scope="row"
                                class="px-6 py-4 font-medium text-gray-900 whitespace-nowrap dark:text-white"
                            >
                            </th>
                            <td id="valor" class="px-6 py-4"></td>
                            <td id="estado" class="px-6 py-4">
                                <span
                                    class="dui_loading dui_loading-dots dui_loading-lg"
                                ></span>
                            </td>
                        </tr>
        `);
            cr.fisTransiciones(
                $.cookie("tkn"),
                $.cookie("evalSession"),
                function (data) {
                    let keys = Object.keys(data.evaluacion);
                    let datos = [];
                    for (let i = 0; i < keys.length; i++) {
                        datos.push({
                            id: keys[i].slice(5),
                            flood: data.evaluacion[keys[i]].flood,
                            objects: data.evaluacion[keys[i]].objects,
                            fis: data.evaluacion[keys[i]].fis,
                            transitabilidad:
                                data.evaluacion[keys[i]].transitabilidad,
                        });
                    }
                    cw.tablaTransicionesT(datos, function () {
                        $("div.barraEval").remove();
                        $("#buttonNext").empty();
                        $("div.botonEnviarT").empty();
                        $("#buttonNext").append(`
                        <div class="flex flex-row gap-2">
                        <button
                            id="volverAtras"
                            type="button"
                            class="h-fit py-2.5 px-5 me-2 text-sm font-medium text-gray-900 bg-white rounded-lg border border-gray-200 hover:bg-gray-100 hover:text-blue-700 focus:z-10 focus:ring-4 focus:outline-none focus:ring-blue-700 focus:text-blue-700 dark:bg-gray-800 dark:text-gray-400 dark:border-gray-600 dark:hover:text-white dark:hover:bg-gray-700 inline-flex items-center"
                        >
                            Volver atrás
                        </button>
                        <button
                            id="finEvaluacion"
                            type="button"
                            class="h-fit focus:outline-none text-white bg-green-700 hover:bg-green-800 focus:ring-4 focus:ring-green-300 font-medium rounded-lg text-sm px-5 py-2.5 me-2 mb-2 dark:bg-green-600 dark:hover:bg-green-700 dark:focus:ring-green-800"
                        >
                            Finalizar Evaluación
                        </button>
                        </div>
                        `);
                        $(`#buttonNext`).show();
                        $("#tablaEvaluacioness").show();
                        $("#finEvaluacion").click(function () {
                            cw.finalizarEvaluacion();
                        });
                        $("#volverAtras").click(function () {
                            cw.evaluar2(keys, data.magnitude);
                        });
                        for (let i = 0; i < keys.length; i++) {
                            $(`#botonEnviarT${keys[i].slice(5)}`).append(`
                                <button id="finEvalB${keys[i].slice(
                                    5
                                )}" type="button" class="h-fit focus:outline-none text-white bg-green-700 hover:bg-green-800 focus:ring-4 focus:ring-green-300 font-medium rounded-lg text-sm px-5 py-2.5 me-2 mb-2 dark:bg-green-600 dark:hover:bg-green-700 dark:focus:ring-green-800">Revisar</button>
                            `);
                            $(`#finEvalB${keys[i].slice(5)}`).click(
                                function () {
                                    cr.transitabilidadTransicion(
                                        $.cookie("tkn"),
                                        $.cookie("evalSession"),
                                        keys[i].slice(5),
                                        $(
                                            `#transitabilidadInput${keys[
                                                i
                                            ].slice(5)}`
                                        ).val(),
                                        function () {
                                            $(
                                                `#estado${keys[i].slice(5)}`
                                            ).empty();
                                            $(
                                                `#estado${keys[i].slice(5)}`
                                            ).append("Revisada");
                                        }
                                    );
                                    $(`#valor${keys[i].slice(5)}`).text(
                                        `${data.evaluacion[keys[i]].flood}/${
                                            data.evaluacion[keys[i]].objects
                                        } => ${$(
                                            `#transitabilidadInput${keys[
                                                i
                                            ].slice(5)}`
                                        ).val()}`
                                    );
                                }
                            );
                            $("#spinner").addClass("hidden");
                            $("#dtarjetaEval").show();
                            $(`#evalF${keys[i].slice(5)}`).append(`
                            <span class="font-semibold text-gray-900 dark:text-white">Evaluación</span>
                            <span class="text-gray-500 dark:text-gray-400">Flood: ${
                                data.evaluacion[keys[i]].flood
                            }</span>
                            <span class="text-gray-500 dark:text-gray-400">Objetos: ${
                                data.evaluacion[keys[i]].objects
                            }</span>
                            `);
                            $(`#evalF${keys[i].slice(5)}`).removeClass(
                                "hidden"
                            );
                            let valorBarra;
                            if (data.evaluacion[keys[i]].transitabilidad) {
                                valorBarra =
                                    data.evaluacion[keys[i]].transitabilidad;
                            } else {
                                valorBarra = data.evaluacion[keys[i]].fis;
                            }
                            $(`#barraTransitabilidad${keys[i].slice(5)}`)
                                .append(`
                                <div class="flex flex-col">
                            <span class="p-2 font-semibold text-gray-900 dark:text-white">Evaluar Transitabilidad (0 Mejor)</span>
                                <input id="transitabilidadInput${keys[i].slice(
                                    5
                                )}" type="range" value="${valorBarra}" min="0" max="10" class="w-90 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700">
                                <span id="transitabilidadRange${keys[i].slice(
                                    5
                                )}" class="p-2">${valorBarra}</span>
                                <div>
                                    <span class="font-semibold text-gray-900 dark:text-white">Recomendación: </span>${
                                        data.evaluacion[keys[i]].fis
                                    }    
                                </div>
                            `);
                            $(`#transitabilidadInput${keys[i].slice(5)}`).on(
                                "input",
                                function () {
                                    $(
                                        `#transitabilidadRange${keys[i].slice(
                                            5
                                        )}`
                                    ).text(this.value);
                                    $(`#estado${keys[i].slice(5)}`).empty();
                                    $(`#estado${keys[i].slice(5)}`).append(
                                        "Modificado"
                                    );
                                }
                            );
                        }
                    });
                }
            );
        } else {
            $(`#buttonNext`).show();
            cw.mostrarAlert("Se deben evaluar todas las vías");
        }
    };

    this.finalizarEvaluacion = function () {
        cr.obtenerEvaluacion(
            $.cookie("tkn"),
            $.cookie("evalSession"),
            function (data) {
                let ret = true;
                let k = Object.keys(data.evaluacion);
                for (let i = 0; i < k.length; i++) {
                    if (!data.evaluacion[k[i]].transitabilidad) {
                        ret = false;
                    }
                }
                if (ret) {
                    cw.modalFinalizar();
                } else {
                    cw.mostrarAlert("Se deben revisar todas las vías");
                }
            }
        );
    };

    this.modalFinalizar = function () {
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
                        <h3 class=" text-lg font-normal text-gray-500 dark:text-gray-400">¿Deseas finalizar la evaluación?</h3>
                        <p class="text-sm text-gray-400 dark:text-gray-300 mb-5">No podrás modificarla una vez finalizada.</p>
                        <div class ="flex flex-row items-center justify-between">
                        <button id="reanudarButton" data-modal-hide="modal" type="button" class="py-2.5 px-5 ms-3 text-sm font-medium text-gray-900 focus:outline-none bg-white rounded-lg border border-gray-200 hover:bg-gray-100 hover:text-blue-700 focus:z-10 focus:ring-4 focus:ring-gray-100 dark:focus:ring-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:border-gray-600 dark:hover:text-white dark:hover:bg-gray-700">Reanudar Evaluación</button>
                        <button id="finalizarButton" data-modal-hide="popup-modal" type="button" class="text-white bg-red-600 hover:bg-red-800 focus:ring-4 focus:outline-none focus:ring-red-300 dark:focus:ring-red-800 font-medium rounded-lg text-sm inline-flex items-center px-5 py-2.5 text-center">
                            Finalizar Evaluación
                        </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `);
        $("#modal").show();
        $("#reanudarButton").click(function () {
            $("#modal").hide();
        });
        $("#finalizarButton").click(function () {
            cr.finalizarEvaluacion(
                $.cookie("tkn"),
                $.cookie("evalSession"),
                function () {
                    $.removeCookie("evalSession");
                    $("#modal").hide();
                    cw.evaluacionFinalizada();
                }
            );
        });
        $("#closeButton").click(function () {
            $("#modal").hide();
        });
    };

    this.evaluacionFinalizada = function () {
        $("#centerContent").load("./clnt/eval/eval3.html", function () {
            $("#verEvaluacionesFin").click(function () {
                cw.evaluacionesAnteriores();
            });
        });
    };

    async function comprobarEval(transiciones) {
        for (const element of transiciones) {
            const result = await new Promise((resolve, reject) => {
                cr.evaluarTransicion(
                    $.cookie("tkn"),
                    $.cookie("evalSession"),
                    element,
                    true,
                    function (trn, flood, objects) {
                        if (flood == null || objects == null) {
                            resolve(false);
                        } else {
                            resolve(true);
                        }
                    }
                );
            });
            if (!result) {
                return false;
            }
        }
        return true;
    }

    async function comprobarRev() {}

    this.evaluacionRecibida = function (transicion, data) {
        $(`#valor${transicion}`).empty();
        $("#tablaEvaluacioness").show();
        $("#evaluarTransitabilidad").show();
        if (data.flood == null && data.objects == null) {
            $(`#valor${transicion}`).append(
                data.GPT["flood"] + "/" + data.GPT["objects"]
            );
            $(`#estado${transicion}`).empty();
            $(`#estado${transicion}`).append("Sin evaluar");
        } else {
            $(`#valor${transicion}`).append(data.flood + "/" + data.objects);
            $(`#estado${transicion}`).empty();
            $(`#estado${transicion}`).append("Evaluado");
        }
        $(`#mostrar${transicion}`).removeProp("disabled");
        $(`#mostrar${transicion}`).empty();
        $(`#mostrar${transicion}`).append(transicion);
        $("#mostrar" + transicion).removeClass("cursor-not-allowed");
        $("#mostrar" + transicion).click(function () {
            cw.mostrarTarjetaEval(transicion);
        });
    };

    this.mostrarTarjetaEval = function (transicion) {
        $("[id^='tarjeta']").addClass("hidden");
        $("#tarjeta" + transicion).removeClass("hidden");
    };

    this.tablaTransicionesT = function (data, callback) {
        $("#tablaTransiciones").empty();
        let tr;
        let str;
        data.forEach((element) => {
            if (element.transitabilidad) {
                tr = element.transitabilidad;
                str = "Revisada";
            } else {
                tr = element.fis;
                str = "Sin revisar";
            }
            $("#tablaTransiciones").append(`
            <tr
                            class="bg-white border-b dark:bg-gray-800 dark:border-gray-700"
                        >
                            <th
                                scope="row"
                                class="px-6 py-4 font-medium text-gray-900 whitespace-nowrap dark:text-white"
                            >
                            <button id="mostrar${element.id}" type="button" class="py-2.5 px-5 me-2 text-sm font-medium text-gray-900 bg-white rounded-lg border border-gray-200 hover:bg-gray-100 hover:text-blue-700 focus:z-10 focus:ring-4 focus:outline-none focus:ring-blue-700 focus:text-blue-700 dark:bg-gray-800 dark:text-gray-400 dark:border-gray-600 dark:hover:text-white dark:hover:bg-gray-700 inline-flex items-center">
                                ${element.id}
                            </button>
                            </th>
                            <td id="valor${element.id}" class="px-6 py-4 text-center">${element.flood}/${element.objects} => ${tr}</td>
                            <td id="estado${element.id}" class="px-6 py-4 text-center">
                                ${str}
                            </td>
                        </tr>
        `);
            $(`#mostrar${element.id}`).removeProp("disabled");
            $(`#mostrar${element.id}`).empty();
            $(`#mostrar${element.id}`).append(element.id);
            $("#mostrar" + element.id).removeClass("cursor-not-allowed");
            $("#mostrar" + element.id).click(function () {
                cw.mostrarTarjetaEval(element.id);
            });
        });
        callback();
    };

    this.tablaTransiciones = function (data, callback) {
        $("#tablaTransiciones").empty();
        data.forEach((element) => {
            $("#tablaTransiciones").append(`
            <tr
                            class="bg-white border-b dark:bg-gray-800 dark:border-gray-700"
                        >
                            <th
                                scope="row"
                                class="px-6 py-4 font-medium text-gray-900 whitespace-nowrap dark:text-white"
                            >
                            <button id="mostrar${element}" type="button" class="py-2.5 px-5 me-2 text-sm font-medium text-gray-900 bg-white rounded-lg border border-gray-200 hover:bg-gray-100 hover:text-blue-700 focus:z-10 focus:ring-4 focus:outline-none focus:ring-blue-700 focus:text-blue-700 dark:bg-gray-800 dark:text-gray-400 dark:border-gray-600 dark:hover:text-white dark:hover:bg-gray-700 inline-flex items-center">
                                <svg aria-hidden="true" role="status" class="inline w-4 h-4 me-3 text-gray-200 animate-spin dark:text-gray-600" viewBox="0 0 100 101" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z" fill="currentColor"/>
                                    <path d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z" fill="#1C64F2"/>
                                </svg>
                                ${element}
                            </button>
                            </th>
                            <td id="valor${element}" class="px-6 py-4 text-center"></td>
                            <td id="estado${element}" class="px-6 py-4 text-center">
                                <span
                                    class="dui_loading dui_loading-dots dui_loading-lg"
                                ></span>
                            </td>
                        </tr>
        `);
        });
        callback();
    };

    this.tarjetaEval = function (datosEval) {
        $("#spinner").addClass("hidden");
        let floodBarra;
        let objectsBarra;
        if (datosEval.flood) {
            floodBarra = datosEval.flood;
            $(`#estado${datosEval.transicion}`).empty();
            $(`#estado${datosEval.transicion}`).append("Evaluado");
            $(`#valor${datosEval.transicion}`).text(
                datosEval.flood + "/" + datosEval.objects
            );
        } else {
            floodBarra = datosEval.floodGPT;
        }
        if (datosEval.objects) {
            objectsBarra = datosEval.objects;
        } else {
            objectsBarra = datosEval.objectsGPT;
        }
        $("#dtarjetaEval").append(`
        <div id="tarjeta${
            datosEval.transicion
        }" class="hidden dui_card w-fit bg-base-150 shadow-xl flex flex-col items-center">
            <h3 class="font-semibold text-gray-900 dark:text-white p-8">Transición ${
                datosEval.transicion
            }</h3>
            <div class="w-[700px] dui_diff aspect-[16/9] p-10">
                <div class="dui_diff-item-1">
                    <img alt="daisy" src="https://backtfg-iwr6ji5k5a-ew.a.run.app/image/imgVias/${
                        datosEval.transicion
                    }.jpg" />
                </div>
                <div class="dui_diff-item-2">
                    <img alt="daisy" src="https://backtfg-iwr6ji5k5a-ew.a.run.app/image/imgEval/${datosEval.sessionId}/${datosEval.transicion}.png" />
                </div>
                <div class="dui_diff-resizer"></div>
            </div>
            <div class="flex flex-row items-center">
                <div class="flex flex-col gap-4 p-10">
                    <span class="font-semibold text-gray-900 dark:text-white">Estimación (IA)</span>
                    <span class="text-gray-500 dark:text-gray-400">Flood: ${
                        datosEval.floodGPT
                    }</span>
                    <span class="text-gray-500 dark:text-gray-400">Objetos: ${
                        datosEval.objectsGPT
                    }</span>
                </div>
                <div id="evalF${
                    datosEval.transicion
                }" class="hidden flex flex-col gap-4 p-10">
                </div>
                <div id="barraFlood" class="barraEval flex flex-col gap-2 relative mb-6 p-10">
                    <span class="font-semibold text-gray-900 dark:text-white">Evaluar Inundación</span>
                    <input id="floodInput${
                        datosEval.transicion
                    }" type="range" value="${floodBarra}" min="0" max="100" class="w-90 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700">
                    <span id="floodRange${
                        datosEval.transicion
                    }">${floodBarra}</span>
                </div>
                <div id="barraObjetos" class="barraEval flex flex-col gap-2 relative mb-6 p-10">
                    <span class="font-semibold text-gray-900 dark:text-white">Evaluar Tamaño Objetos</span>
                    <input id="objectsInput${
                        datosEval.transicion
                    }" type="range" value="${objectsBarra}" min="0" max="10" class="w-90 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700">
                    <span id="objectsRange${
                        datosEval.transicion
                    }">${objectsBarra}</span>
                </div>
                <div id="barraTransitabilidad${
                    datosEval.transicion
                }" class="flex flex-col gap-2 relative mb-6 p-10">
                    
                </div>
                <div id="botonEnviarT${
                    datosEval.transicion
                }" class="botonEnviarT pr-10">
                    <button id="enviarVal${
                        datosEval.transicion
                    }" type="button" class="h-fit focus:outline-none text-white bg-green-700 hover:bg-green-800 focus:ring-4 focus:ring-green-300 font-medium rounded-lg text-sm px-5 py-2.5 me-2 mb-2 dark:bg-green-600 dark:hover:bg-green-700 dark:focus:ring-green-800">Evaluar</button>
                </div>
            </div>
        </div>
        `);

        $(`#floodInput${datosEval.transicion}`).on("input", function () {
            $(`#floodEval${datosEval.transicion}`).text(this.value);
            $(`#floodRange${datosEval.transicion}`).text(this.value);
            $(`#estado${datosEval.transicion}`).empty();
            $(`#estado${datosEval.transicion}`).append("Modificado");
        });

        $(`#objectsInput${datosEval.transicion}`).on("input", function () {
            $(`#objectsValue${datosEval.transicion}`).text(this.value);
            $(`#objectsRange${datosEval.transicion}`).text(this.value);
            $(`#estado${datosEval.transicion}`).empty();
            $(`#estado${datosEval.transicion}`).append("Modificado");
        });

        $(`#enviarVal${datosEval.transicion}`).click(function () {
            $(`#valor${datosEval.transicion}`).text(
                $(`#floodInput${datosEval.transicion}`).val() +
                    "/" +
                    $(`#objectsInput${datosEval.transicion}`).val()
            );
            cr.enviarEvaluacion(
                $.cookie("tkn"),
                $.cookie("evalSession"),
                datosEval.transicion,
                $(`#floodInput${datosEval.transicion}`).val(),
                $(`#objectsInput${datosEval.transicion}`).val(),
                function () {
                    $(`#estado${datosEval.transicion}`).empty();
                    $(`#estado${datosEval.transicion}`).append("Evaluado");
                }
            );
        });
    };

    this.errorLogin = function (mensaje) {
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
    };

    const comprobarDatos = function (email, password) {
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
                        <div id="errorCrearUsuario" class="hidden animate__animated animate__pulse flex items-center p-4 mb-4 text-sm text-red-800 rounded-lg bg-red-50 dark:bg-gray-800 dark:text-red-400" role="alert">
                            <svg class="flex-shrink-0 inline w-4 h-4 me-3" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 20 20">
                              <path d="M10 .5a9.5 9.5 0 1 0 9.5 9.5A9.51 9.51 0 0 0 10 .5ZM9.5 4a1.5 1.5 0 1 1 0 3 1.5 1.5 0 0 1 0-3ZM12 15H8a1 1 0 0 1 0-2h1v-3H8a1 1 0 0 1 0-2h2a1 1 0 0 1 1 1v4h1a1 1 0 0 1 0 2Z"/>
                            </svg>
                            <span class="sr-only">Info</span>
                            <a id="mensajeErrorCrearUsuario"></a>
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
            if (
                $("#passwordUsuario").val() !== "" &&
                $("#nombreUsuario").val() !== "" &&
                $("#apellidosUsuario").val() !== "" &&
                $("#roles").val() !== "" &&
                $("#emailUser").val() !== ""
            ) {
                datos["email"] = $("#emailUser").val();
                datos["password"] = $("#passwordUsuario").val();
                datos["nombre"] = $("#nombreUsuario").val();
                datos["apellidos"] = $("#apellidosUsuario").val();
                datos["rol"] = $("#roles").val();
            } else {
                $("#mensajeErrorCrearUsuario").empty();
                $("#mensajeErrorCrearUsuario").append(
                    "Debes rellenar todos los campos"
                );
                $("#errorCrearUsuario").show();
                return;
            }
            cr.registrarUsuario(datos, $.cookie("tkn"), function (error) {
                if (error) {
                    $("#mensajeErrorCrearUsuario").empty();
                    $("#mensajeErrorCrearUsuario").append(
                        "Email ya registrado"
                    );
                    $("#errorCrearUsuario").show();
                    return;
                }
                obtenerUsuarios("");
                $("#modal").hide();
                cw.mostrarAlert("Usuario creado correctamente");
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
            cr.editarUsuario(data, $.cookie("tkn"), function (error) {
                if (error) {
                    console.log(error);
                } else {
                    obtenerUsuarios("");
                    $("#modal").hide();
                    cw.mostrarAlert("Usuario editado correctamente");
                }
            });
        });
        $("#modal").show();
    };

    this.mostrarAlert = function (mensaje) {
        $("#alertMenu").hide();
        $("#mensajeAlertMenu").empty();
        $("#mensajeAlertMenu").append(mensaje);
        $("#alertMenu").show();
        $("#closeButtonAlert").click(function () {
            $("#alertMenu").hide();
        });
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
                cw.mostrarAlert("Usuario eliminado correctamente");
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
