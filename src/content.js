import { BrowserQRCodeReader } from "@zxing/browser";
const codeReader = new BrowserQRCodeReader();

let linkedQrCodes = 0;
const MIN_IMAGE_SIZE = 50;

const svgs = document.querySelectorAll('svg');
const images = document.querySelectorAll('img');

const getBase64String = (svg) => {
  const svgString = new XMLSerializer().serializeToString(svg);
  const svgData = new Blob([svgString], {type: 'image/svg+xml;charset=utf-8'});

  const DOMURL = window.URL || window.webkitURL || window;
  return DOMURL.createObjectURL(svgData);
}

const loadImage = (url) => new Promise((resolve, reject) => {
  const img = new Image();

  img.src = url;
  img.addEventListener('load', () => resolve(img));
  img.addEventListener('error', (err) => reject(err));
});

const createCanvasFromImage = (image) => {
  const canvas = document.createElement('canvas');
  
  const scale = window.devicePixelRatio * 2; // Handles mobile devices with different pixel ratios
  const imageHeight =image.naturalHeight;
  const imageWidth =image.naturalWidth;

  canvas.width = imageWidth;
  canvas.height = imageHeight;
  canvas['style']['width'] = `${Math.round(imageWidth/scale)}px`;
  canvas['style']['height'] = `${Math.round(imageHeight/scale)}px`;

  const context = canvas.getContext('2d');
  context?.scale(scale, scale);
  context?.drawImage(image, 0, 0, Math.round(imageWidth/scale), Math.round(imageHeight/scale))

  return canvas;
};

const getImageUrl = async (svg) => {
  if (svg.width.baseVal.value < MIN_IMAGE_SIZE || svg.height.baseVal.value < MIN_IMAGE_SIZE) {
    return;
  }

  const base64String = getBase64String(svg);
  const image = await loadImage(base64String);
  const canvas = createCanvasFromImage(image);

  return  canvas.toDataURL('image/png');
};

const getLinkFromImage = async (image) => {
  if (image.width < MIN_IMAGE_SIZE || image.height < MIN_IMAGE_SIZE) {
    return;
  }
  return codeReader.decodeFromImageElement(image);
};

const getLinkFromUrl = async (url) => {
    if (!url) {
      return;
    }

    const result = await codeReader.decodeFromImageUrl(url);
    return result?.getText();
};

const wrapCodeInLink = (link, image) => {
  if (!link) {
    return;
  }

  const wrapper = document.createElement('a');
  wrapper.innerHTML = image.outerHTML;
  wrapper.href = link;
  wrapper.target = '_blank';

  const imageStyles = window.getComputedStyle(image);
  for (const key of imageStyles) {
    wrapper.style[key] = imageStyles[key];
    wrapper.style.cursor = 'pointer';
  }

  image.parentNode ? image.parentNode.replaceChild(wrapper, image) : image.replaceWith(wrapper, image);

  linkedQrCodes++;
};

const getSuccessMessage = () => {
  if (!linkedQrCodes) {
    return 'No valid QR codes found';
  }
  return linkedQrCodes === 1 ? '1 QR code link added' : `${linkedQrCodes} QR code links added`;
};
  
(async () => {
  console.info('Searching for QR codes...');
  
  for (const image of images) {
    try {
      const link = await getLinkFromImage(image);
      wrapCodeInLink(link, image);
    } catch (err) {
      console.warn('Valid QR code not found in image:', err);
    }
  }

  for (const svg of svgs) {
    try {
      const imageUrl = await getImageUrl(svg);
      const link = await getLinkFromUrl(imageUrl);
      wrapCodeInLink(link, svg);
    } catch (err) {
      console.warn('Valid QR code not found in SVG:', err);
    }
  }

  console.info(getSuccessMessage());
})();
