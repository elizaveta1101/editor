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
let vertexArray = [];
let lastAction = []; //первый элемент - режим, остальные - координаты вершин
let descriptionArray = []; //элементы чередуются первый - режим, второй - количество вершин
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
        if (descriptionArray[len - 1] === vertexArray.length) {
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
    let vertexBuffer = gl.createBuffer();

    gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertexArray), gl.STATIC_DRAW);

    let indexArray = [];

    for (let i = 0; i < descriptionArray.length; i += 2) {
        startIndex = descriptionArray[i + 1] / 2;
        if ((i + 3) < descriptionArray.length) {
            endIndex = descriptionArray[i + 3] / 2;
        } else {
            endIndex = vertexArray.length / 2;
        }

        if (descriptionArray[i] === 0 || descriptionArray[i] === 1 || descriptionArray[i] === 2 || descriptionArray[i] === 4) {
            for (let j = startIndex; j < endIndex; j++) {
                indexArray.push(j);
            }
        } else if (descriptionArray[i] === 3) {
            let k = 0;
            for (let j = startIndex; j < endIndex; j++) {
                k++;
                if (k === 4) {
                    indexArray.push(j - 3);
                    indexArray.push(j - 1);
                    k = 0;
                }
                indexArray.push(j);
            }
        }
    }

    let indexBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(indexArray), gl.STATIC_DRAW);

    let vertexPosition = gl.getAttribLocation(shaderProgram, 'a_Position');
    gl.vertexAttribPointer(vertexPosition, 2, gl.FLOAT, gl.FALSE, 0, 0);
    gl.enableVertexAttribArray(vertexPosition);

    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    gl.enable(gl.DEPTH_TEST);

    for (let i = 0; i < descriptionArray.length + 2; i += 2) {

        let mode = descriptionArray[i];
        startIndex = descriptionArray[i + 1];
        if ((i + 3) < descriptionArray.length) {
            endIndex = descriptionArray[i + 3];
        } else {
            endIndex = vertexArray.length;
        }
        /*режим - 0-точка
            1-линия
            2-кривая?
            3-прямоугольник
            4-многоугольник
            5-круг
        */

        if (mode === 0) {
            gl.drawElements(gl.POINTS, endIndex - startIndex, gl.UNSIGNED_SHORT, startIndex);
        } else
        if (mode === 1) {
            gl.drawArrays(gl.LINES, startIndex, (endIndex - startIndex) / 2);
        } else
        if (mode === 2) {
            gl.drawArrays(gl.LINE_STRIP, startIndex, endIndex - startIndex);

        } else if (mode === 3) {
            let amount;
            
            if (endIndex - startIndex === 6) {
                amount = 6;
            } else {
                amount = (endIndex - startIndex) / 8*6;
            }
            gl.drawElements(gl.TRIANGLES, amount, gl.UNSIGNED_SHORT, startIndex);

        } else if (mode === 4) {

            gl.drawArrays(gl.TRIANGLE_FAN, startIndex, (endIndex - startIndex) / 2);

        } else if (mode === 5) {
            gl.drawArrays(gl.TRIANGLE_FAN, startIndex, (endIndex - startIndex) / 2);
        }

    }
}

window.onload = function () {
    const canvas = document.querySelector('#canvas');
    if (!canvas) {
        console.log('failed');
        return;
    }
    canvas.width = 400;
    canvas.height = 400;

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
    if (mode === 4) {
        drawPolygon();
    } else if (mode === 5) {
        drawCircle();
    } else if (descriptionArray.length > 0) {
        click = true;
        let x = event.clientX;
        let y = event.clientY;

        let middle_X = gl.canvas.width / 2;
        let middle_Y = gl.canvas.height / 2;

        let rect = canvas.getBoundingClientRect();

        x = ((x - rect.left) - middle_X) / middle_X;
        y = (middle_Y - (y - rect.top)) / middle_Y;

        vertexArray.push(x);
        vertexArray.push(y);
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
            drawLine();
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
            // const angles = Number(document.getElementById("angles").value);
            // if (len % 5 === 0) {
            //     for (let i = 0; i <=angles; i++) {
            //         vertexArray.pop();
            //     }
            // }
            // vertexArray.push(x);
            // vertexArray.push(y);
            drawPolygon();

        } else if (mode === 5) {


        }
    }
}

function onmouseup(event, canvas) {
    click = false;
    if (vertexArray.length % 4 === 2) {
        vertexArray.pop();
        vertexArray.pop();
    }
}

function drawLine() {
    // let endY = vertexArray.pop();
    // let endX = vertexArray.pop();
    // let startY = vertexArray.pop();
    // let startX = vertexArray.pop();

    // // if ((endX < startX * 1.03 || endX > startX * 0.97) && endY - startY !== 0) {
    // //     endX = startX;
    // // }
    // // if ((endY < startY * 1.03 || endY > startY * 0.97) && endX - startX !== 0) {
    // //     endY = startY;
    // // }

    // vertexArray.push(startX, startY);
    // vertexArray.push(endX, endY);
    draw();
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
    const angles = Number(document.getElementById("angles").value);
    const side = Number(document.getElementById("side").value) / 10;

    let y = vertexArray.pop();
    let x = vertexArray.pop();
    let yc = vertexArray.pop();
    let xc = vertexArray.pop();
    let dx = x - xc;
    let dy = y - yc;

    vertexArray.push(0);
    vertexArray.push(0);

    let R = side / 2 * Math.sin(Math.PI / angles);

    const da = 2 * Math.PI / angles;

    let alpha;
    alpha = 0;

    for (let i = 0; i <= angles; i++) {
        x = R * Math.cos(alpha);
        y = R * Math.sin(alpha);

        vertexArray.push(x);
        vertexArray.push(y);

        alpha += da;
    }
    draw();
}


function drawCircle() {
    const R = Number(document.getElementById("radius").value) / 20;

    let x, y, alpha;
    alpha = 0;
    n = 32;
    vertexArray.push(0);
    vertexArray.push(0);
    const da = 2 * Math.PI / n;
    for (let i = 0; i <= n; i++) {
        x = R * Math.cos(alpha);
        y = R * Math.sin(alpha);

        vertexArray.push(x);
        vertexArray.push(y);

        alpha += da;
    }
    draw();
}

function clearViewport() {
    vertexArray = [];
    descriptionArray = [];
    gl.clearColor(0.7, 0.7, 0.7, 1.0);
    gl.clear(gl.COLOR_BUFFER_BIT);
}