import { BrowserQRCodeReader } from "@zxing/browser";
const codeReader = new BrowserQRCodeReader();

const svgs = document.querySelectorAll('svg');
const images = document.querySelectorAll('img');

const getBase64String = (svg) => {
  const svgString = new XMLSerializer().serializeToString(svg);
  const svgData = new Blob([svgString], {type: 'image/svg+xml;charset=utf-8'});

  const DOMURL = window.URL || window.webkitURL || window;
  return DOMURL.createObjectURL(svgData);
}

const loadImage = (url) => new Promise((resolve, reject) => {
  const img = new Image(); // alt: document.createElement('img')
  img.addEventListener('load', () => resolve(img));
  img.addEventListener('error', (err) => reject(err));
  img.src = url;
});

// const _img = await loadImage(getBase64String(svg));

const getPng = async (svg) => {
  const base64String = getBase64String(svg);
  const image = await loadImage(base64String);
  
  const imgH =image.naturalHeight * 1.1; // original file height
  const imgW =image.naturalWidth * 1.1; // original file width

  const scale = window.devicePixelRatio*2;

  const canvas = document.createElement('canvas');
  canvas.width = imgW;
  canvas.height = imgH;
  canvas['style']['width'] = `${Math.round(imgW/scale)}px`;
  canvas['style']['height'] = `${Math.round(imgH/scale)}px`;
  canvas['style']['margin'] = '5px';
  canvas['style']['padding'] = '5px';

  const context = canvas.getContext('2d');
  context?.scale(scale, scale);

  context?.drawImage(image, 0, 0, Math.round(imgW/scale), Math.round(imgH/scale))

  const dataUrl = canvas.toDataURL('image/png');
  // console.log('dataUrl: ', dataUrl);
  image.src = dataUrl
  image.style.width = `250px`;
  image.style.height = `250px`;
  image.style.margin = '5px';
  image.style.padding = '5px';

  return image;

};

const getQrCodeFromImage = (image) =>
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

  const getQrCodeFromUrl = (url) =>
    codeReader.decodeFromImageUrl(url).then((result) => {
      if (result) {
        console.log('result: ', result.getText());
      }
    }).catch(() => {
      console.error('ERROR');
    });


// TODO cap number of images
// for (const image of images) {
//   console.log('image: ', image);
//   getQrCode(image);
// }

(async () => {
  for (const svg of svgs) {
    const img = await getPng(svg);
    getQrCodeFromUrl(img.src);
  }
})();

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
