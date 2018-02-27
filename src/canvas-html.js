export const canvasHtml = (imageBlob, options) => {
  const optionsString = JSON.stringify(options);
  return `
      <!DOCTYPE html>
      <html>
      <script type='text/javascript'>
      function getColorPalettes(options) {
        var _options$imageType = options.imageType,
          imageType = _options$imageType === undefined ? 'jpeg' : _options$imageType,
          _options$paletteCount = options.paletteCount,
          paletteCount = _options$paletteCount === undefined ? 3 : _options$paletteCount,
          _options$defaultPalet = options.defaultPalette,
          defaultPalette = _options$defaultPalet === undefined ? [0, 0, 0, 1] : _options$defaultPalet,
          _options$paletteType = options.paletteType,
          paletteType = _options$paletteType === undefined ? 'dominant' : _options$paletteType,
          _options$colorType = options.colorType, colorType = _options$colorType === undefined ? 'rgba' : _options$colorType;
        var imageElement = document.getElementById('__colorPickerCanvasImage');
        var canvas = document.createElement('canvas');
        var canvasContext = canvas.getContext && canvas.getContext('2d');
        if (!canvasContext) return defaultPalette;
        var imageWidth = canvas.width = imageElement.naturalWidth || imageElement.offsetWidth || imageElement.width;
        var imageHeight = canvas.height = imageElement.naturalHeight || imageElement.offsetHeight || imageElement.height;
        canvasContext.drawImage(imageElement, 0, 0);
        var palette = [];
        if (paletteType === 'average') palette = getAveragePalette({
          imageWidth: imageWidth,
          imageHeight: imageHeight,
          canvasContext: canvasContext,
          colorType: colorType
        }); else palette = getDominantPalettes(getAllPalettes(imageWidth, imageHeight, canvasContext), paletteCount, colorType);
        window.postMessage(JSON.stringify({'message': 'imageColorPicker', 'payload': palette}));
      }

      function getAveragePalette(_ref) {
        var imageWidth = _ref.imageWidth, imageHeight = _ref.imageHeight, canvasContext = _ref.canvasContext,
          _ref$colorType = _ref.colorType, colorType = _ref$colorType === undefined ? 'rgb' : _ref$colorType;
        var blockSize = 5;
        var i = -4;
        var count = 0;
        var red = green = blue = 0, alpha = 1;
        try {
          data = canvasContext.getImageData(0, 0, imageWidth, imageHeight);
        } catch (e) {
          console.log(e);
        }
        while ((i += blockSize * 4) < data.data.length) {
          ++count;
          red += data.data[i];
          green += data.data[i + 1];
          blue += data.data[i + 2];
        }
        red = ~~(red / count);
        green = ~~(green / count);
        blue = ~~(blue / count);
        if (colorType === 'hex') return [[rgbToHex([red, green, blue])]]; else return [[red, green, blue, alpha]];
      }

      function rgbToHex(rgba) {
        var hexColor = '#';
        rgba.slice(0, 3).forEach(function (c) {
          var hex = c.toString(16);
          hexColor += hex.length == 1 ? '0' + hex : hex;
        });
        return hexColor;
      }

      function getAllPalettes(width, height, context) {
        var distinctPalettes = [];
        for (var i = 0; i <= height; i++) {
          for (var j = 0; j <= width; j++) {
            try {
              data = context.getImageData(i, j, 1, 1);
              if (data.data.toString().trim() !== '0,0,0,0') {
                distinctPalettes.push(data.data);
              }
            } catch (e) {
              console.log(e);
            }
          }
        }
        return distinctPalettes;
      }

      function getDominantPalettes(allPalettes, distinctCount) {
        var colorType = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : 'rgb';
        var combinations = getPaletteOccurrences(allPalettes);
        var palettes = combinations[0];
        var occurrences = combinations[1];
        var dominantPalettes = [];
        var _loop = function _loop() {
          var dominant = 0, dominantKey = 0;
          occurrences.forEach(function (v, k) {
            if (v > dominant) {
              dominant = v;
              dominantKey = k;
            }
          });
          if (colorType === 'hex') dominantPalettes.push(rgbToHex(palettes[dominantKey])); else dominantPalettes.push(palettes[dominantKey]);
          palettes.splice(dominantKey, 1);
          occurrences.splice(dominantKey, 1);
          distinctCount--;
        };
        while (distinctCount) {
          _loop();
        }
        return dominantPalettes;
      }

      function getPaletteOccurrences(palettes) {
        var paletteList = [], occurrenceList = [], previousPalette = void 0;
        palettes.sort();
        palettes.forEach(function (palette, key) {
          if (palette.toString() !== previousPalette) {
            paletteList.push(palette);
            occurrenceList.push(1);
          } else {
            occurrenceList[occurrenceList.length - 1]++;
          }
          previousPalette = palettes[key].toString();
        });
        return [paletteList, occurrenceList];
      }

      var interval = setInterval(function () {
        var img = document.getElementById('__colorPickerCanvasImage');
        if (img.src.length != 0) {
          getColorPalettes(${optionsString});
          clearInterval(interval);
        }
      }, 10);
      </script>
      <body>
        <img src='data:image/${options.imageType};base64,${imageBlob}'
          width='${options.imageWidth}px'
          height='${options.imageHeight}px'
          id='__colorPickerCanvasImage'
          onload='getColorPalettes(${optionsString})'/>
      </body>
      </html>
    `;
};
