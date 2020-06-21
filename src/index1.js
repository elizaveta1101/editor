const VSHADER_SOURCE = //источник кода для вершинного шейдера
    'attribute vec2 a_Position;\n' +
    'varying vec3 v_Color;\n' +
    'void main() {\n' +
    '   v_Color=vec3(a_Position, 0.5);\n' +
    '   gl_Position=vec4(a_Position, 0.0, 1.0);\n' + //координаты точки
    '}\n';

const FSHADER_SOURCE = //источник кода для фрагментного шейдера
    'precision mediump float;\n' +
    'varying vec3 v_Color;\n' +
    'void main() {\n' +
    '   gl_FragColor=vec4(v_Color, 1.0);\n' + //цвет точки
    '}\n';

let gl;
let shaderProgram;
let vertexArray = []; //элементы чередуются: первый - x, второй - y
let descriptionArray = []; //элементы чередуются: первый - режим, второй - индекс первой вершины
let xc, yc; //коррдинаты центра многоугольника/круга 
let polygonAngles = []; //массив для хранения количества углов полигонов
let circleRadius = []; //массив для хранения радиусов окружностей
/*режим - 0-точка
    1-линия
    2-кривая?
    3-прямоугольник
    4-многоугольник
    5-круг
*/
let click = false;

const buttons = document.querySelectorAll(".editor .editor__functions button");

buttons.forEach(btn => {
    btn.addEventListener("click", () => {
        let len = descriptionArray.length;
        let mode;
        switch (btn.id) {
            case "functionLine":
                mode = 1;
                break;
            case "functionCurve":
                mode = 2;
                break;
            case "functionRectangle":
                mode = 3;
                break;
            case "functionPolygon":
                mode = 4;
                break;
            case "functionCircle":
                mode = 5;
                break;
        }
        if (descriptionArray[len - 1] === vertexArray.length || descriptionArray[len - 2] === mode) {
            descriptionArray[len - 2] = mode;
        } else {
            descriptionArray.push(mode);
            descriptionArray.push(vertexArray.length);
        }
    });
});


function initShaders() {
    const VS = getShader(gl.VERTEX_SHADER, VSHADER_SOURCE); //получаем вершинный шейдер
    const FS = getShader(gl.FRAGMENT_SHADER, FSHADER_SOURCE); //получаем фрагментный шейдер

    shaderProgram = gl.createProgram(); //создаем программу
    gl.attachShader(shaderProgram, VS); //добавляем в нее вершинный шейдер
    gl.attachShader(shaderProgram, FS); //добавляем в нее фрагментный шейдер
    gl.linkProgram(shaderProgram); //связываем добавленные шейдеры
    gl.useProgram(shaderProgram); //начинаем использование программы


    shaderProgram.vertexPositionAttribute = gl.getAttribLocation(shaderProgram, 'a_Position');
    gl.enableVertexAttribArray(shaderProgram.vertexPositionAttribute);

    // shaderProgram.vertexColorAttribute = gl.getAttribLocation(shaderProgram, 'a_Color');
    // gl.enableVertexAttribArray(shaderProgram.vertexColorAttribute);
}

function getShader(type, source) {
    let shader;
    shader = gl.createShader(type);

    gl.shaderSource(shader, source);
    gl.compileShader(shader);

    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
        alert(gl.getShaderInfoLog(shader));
        gl.deleteShader(shader);
        return null;
    }
    return shader;
}


function draw() {
    // let vertexBuffer = gl.createBuffer();

    // gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
    // gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertexArray), gl.STATIC_DRAW);

    // let indexArray = []; //массив индексов
    // console.log('vertex');
    // console.log(vertexArray);

    // let numberOfPolygon = 0;
    // let numberOfCircle = 0;
    // for (let i = 0; i < descriptionArray.length; i += 2) {
    //     let mode = descriptionArray[i];
    //     let startIndex = descriptionArray[i + 1] / 2;
    //     let k = startIndex;

    //     let endIndex;
    //     if ((i + 3) < descriptionArray.length) {
    //         endIndex = descriptionArray[i + 3] / 2;
    //     } else {
    //         endIndex = vertexArray.length / 2;
    //     }

    //     if (mode === 4) {
    //         numberOfPolygon++;
    //     } else
    //     if (mode === 5) {
    //         numberOfCircle++;
    //     }

    //     for (let j = startIndex; j < endIndex; j++) {
    //         indexArray.push(j);
    //         /*режим - 0-точка
    //             1-линия
    //             2-кривая?
    //             3-прямоугольник
    //             4-многоугольник
    //             5-круг
    //         */
    //         if (mode === 3) {
    //             if ((j - k) % 4 !== 0) {
    //                 indexArray.push(j);
    //             }
    //             if (j - k + 1 === 4) {
    //                 indexArray.push(k);
    //                 k += 4;
    //             }

    //         } else
    //         if (mode === 4) {
    //             angles = polygonAngles[numberOfPolygon - 1];
    //             if ((j - k) % angles !== 0) {
    //                 indexArray.push(j);
    //             }
    //             if (j - k + 1 === angles) {
    //                 indexArray.push(k);
    //                 k += angles;
    //                 numberOfPolygon++;
    //             }
    //         } else
    //         if (mode === 5) {
    //             const n = circleRadius[numberOfCircle - 1];

    //             if ((j - k) % n !== 0) {
    //                 indexArray.push(j);
    //             }
    //             if (j - k + 1 === n) {
    //                 indexArray.push(k);
    //                 k += n;
    //                 numberOfCircle++;
    //             }
    //         }
    //     }

    // }

    // console.log('index');
    // console.log(indexArray);
    // let indexBuffer = gl.createBuffer();
    // gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);
    // gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(indexArray), gl.STATIC_DRAW);

    let vertexPosition = gl.getAttribLocation(shaderProgram, 'a_Position');
    gl.vertexAttribPointer(vertexPosition, 2, gl.FLOAT, gl.FALSE, 0, 0);
    gl.enableVertexAttribArray(vertexPosition);

    gl.clear(gl.DEPTH_BUFFER_BIT);
    gl.enable(gl.DEPTH_TEST);


    // for (let i = 0; i < descriptionArray.length; i += 2) {

    //     let mode = descriptionArray[i];
    //     startIndex = descriptionArray[i + 1];
    //     if ((i + 3) < descriptionArray.length) {
    //         endIndex = descriptionArray[i + 3];
    //     } else {
    //         endIndex = vertexArray.length;
    //     }
    //     /*режим - 0-точка
    //         1-линия
    //         2-кривая?
    //         3-прямоугольник
    //         4-многоугольник
    //         5-круг
    //     */
    //     if (mode === 1) {
    //         amount = (endIndex - startIndex) / 2;
    //     } else {
    //         amount = (endIndex - startIndex);
    //     }
    //     console.log(startIndex + 'start');
    //     console.log(endIndex + 'end');
    //     console.log(amount + 'amount');
    //     gl.drawElements(gl.LINES, amount, gl.UNSIGNED_SHORT, startIndex);
    // }
}

window.onload = function () {
    const canvas = document.querySelector('#canvas');
    if (!canvas) {
        console.log('failed');
        return;
    }
    canvas.width = 500;
    canvas.height = 500;

    try {
        gl = canvas.getContext("webgl", {
            antialias: false
        });
    } catch (e) {
        alert("You are not webgl compatible :(");
    }

    if (gl) {
        gl.viewportWidth = canvas.width;
        gl.viewportHeight = canvas.height;

        initShaders();

        canvas.addEventListener('mousedown', function (event) {
            onmousedown(event, canvas);
        });
        canvas.addEventListener('mousemove', function (event) {
            onmousemove(event, canvas);
        });
        canvas.addEventListener('mouseup', function (event) {
            onmouseup(event, canvas);
        });

        gl.viewport(0, 0, gl.viewportWidth, gl.viewportHeight);
        gl.clearColor(0.7, 0.7, 0.7, 1.0);
        gl.clear(gl.COLOR_BUFFER_BIT);

        draw();
    }
}

function onmousedown(event, canvas) {
    let mode = descriptionArray[descriptionArray.length - 2];

    let x = event.clientX;
    let y = event.clientY;

    let middle_X = gl.canvas.width / 2;
    let middle_Y = gl.canvas.height / 2;

    let rect = canvas.getBoundingClientRect();

    x = ((x - rect.left) - middle_X) / middle_X;
    y = (middle_Y - (y - rect.top)) / middle_Y;

    xc = x;
    yc = y;

    if (descriptionArray.length > 0 && mode < 4) {
        click = true;
        vertexArray.push(x);
        vertexArray.push(y);
    } else
    if (mode === 4) {
        const angles = Number(document.getElementById("angles").value);
        polygonAngles.push(angles);
        drawPolygon();
    } else
    if (mode === 5) {
        const R = Number(document.getElementById("radius").value) * 10;
        circleRadius.push(R);
        drawCircle();
    }
}

function onmousemove(event, canvas) {
    if (click === true) {

        let x = event.clientX;
        let y = event.clientY;

        let middle_X = gl.canvas.width / 2;
        let middle_Y = gl.canvas.height / 2;

        let rect = canvas.getBoundingClientRect();

        x = ((x - rect.left) - middle_X) / middle_X;
        y = (middle_Y - (y - rect.top)) / middle_Y;

        let mode = descriptionArray[descriptionArray.length - 2]; //берем предпоследний элемент, чтобы определить режим построения

        let len = vertexArray.length - descriptionArray[descriptionArray.length - 1];

        /*режим - 0-точка
            1-линия
            2-кривая?
            3-прямоугольник
            4-многоугольник
            5-круг
        */

        if (mode === 1) {
            if (len % 4 === 0) {
                vertexArray.pop();
                vertexArray.pop();
            }
            vertexArray.push(x);
            vertexArray.push(y);
            drawLine(canvas);
        } else if (mode === 2) {


        } else if (mode === 3) {
            if (len % 8 === 0) {
                for (let i = 0; i < 6; i++) {
                    vertexArray.pop();
                }
            }
            vertexArray.push(x);
            vertexArray.push(y);
            drawRectangle();

        } else if (mode === 4) {
            angles = polygonAngles[polygonAngles.length - 1];
            if (len % angles === 0) {
                for (let i = 0; i < angles; i++) {
                    vertexArray.pop();
                }
            }
            vertexArray.push(x);
            vertexArray.push(y);
            drawPolygon();

        } else if (mode === 5) {


        }
    }
}

function onmouseup(event, canvas) {
    click = false;
    if (vertexArray.length % 4 === 2 && descriptionArray[descriptionArray.length - 2] < 4) {
        vertexArray.pop();
        vertexArray.pop();
    }
}

function drawLine(canvas) {
    let vertexBuffer = gl.createBuffer();

    gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertexArray), gl.STATIC_DRAW);
    

    let vertexPosition = gl.getAttribLocation(shaderProgram, 'a_Position');
    gl.vertexAttribPointer(vertexPosition, 2, gl.FLOAT, gl.FALSE, 0, 0);
    gl.enableVertexAttribArray(vertexPosition);
   
    // gl.clear(gl.COLOR_BUFFER_BIT);
    console.log(vertexArray);
    gl.drawArrays(gl.LINES,(vertexArray.length-4), 2);
}

function drawCurve() {}

function drawRectangle() {
    let endY = vertexArray.pop();
    let endX = vertexArray.pop();
    let startY = vertexArray.pop();
    let startX = vertexArray.pop();

    vertexArray.push(startX, startY); //левый верхний угол
    vertexArray.push(endX, startY); //правый верхний угол
    vertexArray.push(endX, endY); //правый нижний угол
    vertexArray.push(startX, endY); //левый нижний угол

    draw();
}

function drawPolygon() {
    angles = polygonAngles[polygonAngles.length - 1];
    let startAngle = Number(document.getElementById("turn").value);
    const side = Number(document.getElementById("side").value) * 5 / 250; //считываем длину в м и переводим ее в пиксели 
    //1м = 5пкс
    //затем нужно нормализовать (привести к виду от 0 до 1)
    //поделим на 500 пкс (ширина канваса)

    // let yk = vertexArray.pop();
    // let xk = vertexArray.pop();


    // let R = Math.sqrt(Math.pow((xk-xc),2) + Math.pow((yk-yc),2));
    let R = side / 2 / Math.sin(Math.PI / angles);
    startAngle = toRad(startAngle);

    const da = 2 * Math.PI / angles;


    let alpha;
    alpha = 0;

    for (let i = 0; i < angles; i++) {
        x = R * Math.cos(alpha + startAngle) + xc;
        y = R * Math.sin(alpha + startAngle) + yc;

        vertexArray.push(x);
        vertexArray.push(y);

        alpha += da;
    }
    draw();
}


function drawCircle() {
    let R = Number(document.getElementById("radius").value);

    let x, y, alpha;
    alpha = 0;
    n = 10 * R;
    R = R * 5 / 250;

    const da = 2 * Math.PI / n;
    for (let i = 0; i < n; i++) {
        x = R * Math.cos(alpha) + xc;
        y = R * Math.sin(alpha) + yc;

        vertexArray.push(x);
        vertexArray.push(y);

        alpha += da;
    }
    draw();
}

function clearViewport() {
    vertexArray = [];
    descriptionArray = [];
    polygonAngles = [];
    circleRadius=[];
    gl.clearColor(0.7, 0.7, 0.7, 1.0);
    gl.clear(gl.COLOR_BUFFER_BIT);
}

function toDeg(rad) {
    return rad * 180 / Math.PI;
}

function toRad(deg) {
    return deg / 180 * Math.PI;
}