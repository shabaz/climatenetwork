var updateCommunitySlider;

function startCommunityPlot() {
    

var canvas;
var gl;
var squareVerticesBuffer;
var textureCoordBuffer;
var vertexIndexBuffer;
var mvMatrix;
var shaderProgram;
var vertexPositionAttribute;
var texturePositionAttribute;
var perspectiveMatrix;

var comTextureArray;

var currentColor = -1;

var currentBlock = undefined;



    var mainDiv = document.getElementById("main");
    document.body.scrollLeft = mainDiv.offsetLeft;
    mainDiv.scrollIntoView({block: "start", behavior: "smooth"});
    var h2s = document.getElementsByTagName('h2');

    for(var i = 0; i < h2s.length; i++) {
        h2s[i].addEventListener('click', function(evt) {
            if (currentBlock ==  this) {
                currentBlock = undefined;
                mainDiv.style.transform = 'scale(0.5)';
                document.body.scrollLeft = mainDiv.offsetLeft;
                mainDiv.scrollIntoView({block: "start", behavior: "smooth"});
            } else {
                currentBlock = this;
                mainDiv.style.transform = 'scale(1.0)';
            document.body.scrollLeft = this.offsetLeft;
                
                this.scrollIntoView({block: "start", behavior: "smooth"});
            }
            
        }, false);

    }


    canvas = document.getElementById("community-canvas");

    function getMousePos(canvas, evt) {
        var rect = canvas.getBoundingClientRect();
        return {
            x: evt.clientX - rect.left,
            y: evt.clientY - rect.top
        };
    }


    gl = canvas.getContext("experimental-webgl");


    if (gl) {
        gl.clearColor(0.0, 0.0, 0.0, 1.0);  // Clear to black, fully opaque
        gl.clearDepth(1.0);                 // Clear everything
        gl.enable(gl.DEPTH_TEST);           // Enable depth testing
        gl.depthFunc(gl.LEQUAL);            // Near things obscure far things



        initShaders();
        initBuffers();

        comTextureArray = Array(12);
        for (var i = 0; i < 12; i++) {
            comTextureArray[i] = gl.createTexture();
        }

        canvas.addEventListener('mouseenter', function(evt) {
                var communityInfoBlock = document.getElementById("community-info-block");
                communityInfoBlock.style.display = "block";
        }, false);

        canvas.addEventListener('mouseleave', function(evt) {
                var communityInfoBlock = document.getElementById("community-info-block");
                communityInfoBlock.style.display = "none";
        }, false);

        loadData("./communities_over_time.bin", comTextureArray);
        loadDataCorrPerPosition("./correlations_per_position.bin");


    }

function loadDataCorrPerPosition(filename) {
    var oReq = new XMLHttpRequest();
    oReq.open("GET", filename, true);
    oReq.responseType = "arraybuffer";
    oReq.send(null);

    oReq.onload = function (oEvent) {
        var arrayBuffer = new Float32Array(oReq.response);

        if (arrayBuffer) {
            canvas.addEventListener('mousemove', function(evt) {
                var mousePos = getMousePos(canvas, evt);
                var i = Math.floor(mousePos.x/640.0*144);
                var j = Math.floor(mousePos.y/480.0*73);

                var texNum = parseInt(document.getElementById("community-range").value);
                var humTemp = arrayBuffer[(j*144+(i+72)%144 + texNum*(144*73*6)) +  0*(144*73)].toFixed(2);
                var humPres = arrayBuffer[(j*144+(i+72)%144 + texNum*(144*73*6)) +  1*(144*73)].toFixed(2);
                var humPrec = arrayBuffer[(j*144+(i+72)%144 + texNum*(144*73*6)) +  2*(144*73)].toFixed(2);
                var tempPres = arrayBuffer[(j*144+(i+72)%144 + texNum*(144*73*6)) + 3*(144*73)].toFixed(2);
                var tempPrec = arrayBuffer[(j*144+(i+72)%144 + texNum*(144*73*6)) + 4*(144*73)].toFixed(2);
                var presPrec = arrayBuffer[(j*144+(i+72)%144 + texNum*(144*73*6)) + 5*(144*73)].toFixed(2);

                var message = "absolute correlation pair values:<br/> humidity-temperature: " +humTemp+"<br/>";
                message += "humidity-pressure: "+humPres+"<br/>";
                message += "humidity-precipitable water: "+humPrec+"<br/>";
                message += "temperature-pressure: "+tempPres+"<br/>";
                message += "temperature-precipitable water: "+tempPrec+"<br/>";
                message += "pressure-precipitable water: "+presPrec;

                var communityInfoBlock = document.getElementById("community-info-block");
                communityInfoBlock.innerHTML = message;

            }, false);
        }


        gl.uniform1i(gl.getUniformLocation(shaderProgram, "uSampler"), 0);
        //updateSlider(document.getElementById("dataset-range").value);

        drawScene();
    };
}

function loadData(filename, textureArray) {
    var oReq = new XMLHttpRequest();
    oReq.open("GET", filename, true);
    oReq.responseType = "arraybuffer";
    oReq.send(null);

    oReq.onload = function (oEvent) {
        var arrayBuffer = new Int32Array(oReq.response);

        if (arrayBuffer) {
            var has_float_tex = gl.getExtension("OES_texture_float");
            for (var texNum = 0; texNum < 12; texNum++)
            {
                var data = new Float32Array(256*128*3);

                for (var i = 0; i < 256; i++) {
                    for (var j = 0; j < 128; j++) {
                        if (i < 144 && j < 73) {
                            data[(j*256+i)*3+2] = arrayBuffer[j*144+(i+72)%144 + texNum*(144*73)];
                            data[(j*256+i)*3+1] = arrayBuffer[j*144+(i+72)%144 + texNum*(144*73)];
                            data[(j*256+i)*3+0] = arrayBuffer[j*144+(i+72)%144 + texNum*(144*73)];
                        }
                    }
                }
                gl.activeTexture(gl.TEXTURE0);
                gl.bindTexture(gl.TEXTURE_2D, textureArray[texNum]);
                gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, 256, 128, 0, gl.RGB, gl.FLOAT, data);
                gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
                gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST_MIPMAP_NEAREST);
                gl.generateMipmap(gl.TEXTURE_2D);
            }



            canvas.addEventListener('click', function(evt) {
                var mousePos = getMousePos(canvas, evt);
                var i = Math.floor(mousePos.x/640.0*144);
                var j = Math.floor(mousePos.y/480.0*73);

                var texNum = parseInt(document.getElementById("community-range").value);
                communityNum = arrayBuffer[j*144+(i+72)%144 + texNum*(144*73)];
                if (currentColor == -1) {
                    currentColor = communityNum;
                } else {
                    currentColor = -1;
                }
                drawScene();

            }, false);
        }


        gl.uniform1i(gl.getUniformLocation(shaderProgram, "uSampler"), 0);
        //updateSlider(document.getElementById("dataset-range").value);

        drawScene();
    };
}


function initBuffers() {
  squareVerticesBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, squareVerticesBuffer);
  var vertices = [
    1.0,  1.0,  0.0,
    -1.0, 1.0,  0.0,
    1.0,  -1.0, 0.0,
    -1.0, -1.0, 0.0
  ];
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW);

  
  textureCoordBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, textureCoordBuffer);
  
  var textureCoordinates = [
    144.0/256.0, 0.0,
    0.0, 0.0,
    144.0/256.0, 73.0/128.0,
    0.0, 73.0/128.0,
  ];

  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(textureCoordinates),
                gl.STATIC_DRAW);

  // Build the element array buffer; this specifies the indices
  // into the vertex array for each face's vertices.
  
  verticesIndexBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, verticesIndexBuffer);
  
  // This array defines each face as two triangles, using the
  // indices into the vertex array to specify each triangle's
  // position.
  
  var vertexIndexBuffer = [
    0,  1,  2,      0,  2,  3,    // front
  ]
  
  // Now send the element array to GL
  
  gl.bufferData(gl.ELEMENT_ARRAY_BUFFER,
      new Uint16Array(verticesIndexBuffer), gl.STATIC_DRAW);

}

function drawScene() {
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
  
  gl.bindBuffer(gl.ARRAY_BUFFER, squareVerticesBuffer);
  gl.vertexAttribPointer(vertexPositionAttribute, 3, gl.FLOAT, false, 0, 0);
  gl.bindBuffer(gl.ARRAY_BUFFER, textureCoordBuffer);
  gl.vertexAttribPointer(texturePositionAttribute, 2, gl.FLOAT, false, 0, 0);

  var sliderVal = parseInt(document.getElementById("community-range").value);

  gl.bindTexture(gl.TEXTURE_2D, comTextureArray[sliderVal]);
  gl.uniform1i(gl.getUniformLocation(shaderProgram, "dataType"), 5);
  gl.uniform1i(gl.getUniformLocation(shaderProgram, "currentColor"), currentColor);

  orthoMatrix = makeOrtho(-1, 1, -1, 1, -10, 10);
  loadIdentity();
  mvTranslate([-0.0, 0.0, -6.0]);
  setMatrixUniforms();
  gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
}

function initShaders() {
  var fragmentShader = getShader(gl, "shader-fs");
  var vertexShader = getShader(gl, "shader-vs");
  
  
  shaderProgram = gl.createProgram();
  gl.attachShader(shaderProgram, vertexShader);
  gl.attachShader(shaderProgram, fragmentShader);
  gl.linkProgram(shaderProgram);
  
  if (!gl.getProgramParameter(shaderProgram, gl.LINK_STATUS)) {
    alert("Unable to initialize the shader program.");
  }
  
  gl.useProgram(shaderProgram);
  
  vertexPositionAttribute = gl.getAttribLocation(shaderProgram, "aVertexPosition");
  gl.enableVertexAttribArray(vertexPositionAttribute);

  texturePositionAttribute = gl.getAttribLocation(shaderProgram, "aTexCoord");
  gl.enableVertexAttribArray(texturePositionAttribute);
}

function getShader(gl, id) {
  var shaderScript = document.getElementById(id);
  
  if (!shaderScript) {
    return null;
  }
  
  // Walk through the source element's children, building the
  // shader source string.
  
  var theSource = "";
  var currentChild = shaderScript.firstChild;
  
  while(currentChild) {
    if (currentChild.nodeType == 3) {
      theSource += currentChild.textContent;
    }
    
    currentChild = currentChild.nextSibling;
  }
  
  // Now figure out what type of shader script we have,
  // based on its MIME type.
  
  var shader;
  
  if (shaderScript.type == "x-shader/x-fragment") {
    shader = gl.createShader(gl.FRAGMENT_SHADER);
  } else if (shaderScript.type == "x-shader/x-vertex") {
    shader = gl.createShader(gl.VERTEX_SHADER);
  } else {
    return null;  // Unknown shader type
  }
  
  // Send the source to the shader object
  
  gl.shaderSource(shader, theSource);
  
  // Compile the shader program
  
  gl.compileShader(shader);
  
  // See if it compiled successfully
  
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    alert("An error occurred compiling the shaders: " + gl.getShaderInfoLog(shader));
    return null;
  }
  
  return shader;
}




//
// Matrix utility functions
//

function loadIdentity() {
  mvMatrix = Matrix.I(4);
}

function multMatrix(m) {
  mvMatrix = mvMatrix.x(m);
}

function mvTranslate(v) {
  multMatrix(Matrix.Translation($V([v[0], v[1], v[2]])).ensure4x4());
}

function setMatrixUniforms() {
  var pUniform = gl.getUniformLocation(shaderProgram, "uPMatrix");
  gl.uniformMatrix4fv(pUniform, false, new Float32Array(orthoMatrix.flatten()));

  var mvUniform = gl.getUniformLocation(shaderProgram, "uMVMatrix");
  gl.uniformMatrix4fv(mvUniform, false, new Float32Array(mvMatrix.flatten()));
}


function mvRotate(angle, v) {
  var inRadians = angle * Math.PI / 180.0;
  
  var m = Matrix.Rotation(inRadians, $V([v[0], v[1], v[2]])).ensure4x4();
  multMatrix(m);
}


updateCommunitySlider = function(sliderVal) {
    //gl.bindTexture(gl.TEXTURE_2D, tempTextureArray[sliderVal]);
    //document.getElementById("dataset-date").innerHTML=months[sliderVal%12]+", "+(Math.floor(sliderVal/12)+1948);
    var startRange = sliderVal*5 + 1948;
    document.getElementById("community-date").innerHTML= startRange + " to " + (startRange+4);
    drawScene();
}



}
