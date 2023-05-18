import { BrowserQRCodeReader } from "@zxing/browser";
const codeReader = new BrowserQRCodeReader();

const svgs = document.querySelectorAll('svg');
const images = document.querySelectorAll('img');

const getPng = (image) => {
  const canvas = document.createElement('canvas');
  const context = canvas.getContext('2d');
  const svgString = new XMLSerializer().serializeToString(image);
  const DOMURL = window.URL || window.webkitURL || window;
  const img = new Image();
  const svg = new Blob([svgString], {type: 'image/svg+xml;charset=utf-8'});
  const url = DOMURL.createObjectURL(svg);
  context?.drawImage(img, 0, 0);
  const png = canvas.toDataURL('image/png');
  img.src = url;

  return img;
};

const getQrCode = (image) =>
  codeReader.decodeFromImageElement(image).then((result) => {
    if (result) {
      const wrapper = document.createElement('a');
      wrapper.innerHTML = image.outerHTML;
      wrapper.href = result.getText();
      wrapper.target = '_blank';

      const imageStyles = window.getComputedStyle(image);
      for (const key of imageStyles) {
        wrapper.style[key] = imageStyles[key];
        wrapper.style.cursor = 'pointer';
      }
  
      image.parentNode ? image.parentNode.replaceChild(wrapper, image) : image.replaceWith(wrapper, image);
    }

  }).catch(err => {
    console.error(err);
  });

// TODO cap number of images
for (const image of images) {
  getQrCode(image);
}

for (const svg of svgs) {
  const img = getPng(svg);
  getQrCode(img);
}

// const getQrCode = (image) => {
//   if (!image.width || !image.height) {
//     return;
//   }

//   // if (image && image.w)idth && image.height) {
//     image.crossOrigin = 'Anonymous';
//     const canvasElements = document.createElement("canvas");
//     canvasElements.width = image.width;
//     canvasElements.height = image.height;
//     const context = canvasElements.getContext('2d');
//     // context.scale(canvasElements.width / image.width, canvasElements.height / image.height);
//     // context.drawImage(image, 0, 0);
//     context.drawImage(image, 0, 0, image.width, image.height);

//     // const v = await Canvg.from(context, image);

//     // get imagedata from context
//     const imageData = context.getImageData(0, 0, canvasElements.width, canvasElements.height);
//     console.log('imageData: ', imageData.data, imageData.width, imageData.height, canvasElements.width, canvasElements.height);

//     const code = jsQR(imageData.data, imageData.width, imageData.height);
//     console.log('code: ', code);

//     if (code) {
//       console.log("Found QR code", code);
//       alert('Found QR code' + code);
//     }
//   // }
// }
