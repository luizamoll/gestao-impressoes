(() => {
  const oldIcons = [...document.querySelectorAll('link[rel~="icon"]')];
  oldIcons.forEach(icon => icon.remove());

  const img = new Image();
  img.onload = () => {
    const canvas = document.createElement("canvas");
    const size = 96;
    canvas.width = size;
    canvas.height = size;

    const ctx = canvas.getContext("2d", { willReadFrequently: true });
    ctx.clearRect(0, 0, size, size);

    const padding = 8;
    const max = size - padding * 2;
    const ratio = Math.min(max / img.naturalWidth, max / img.naturalHeight);
    const width = img.naturalWidth * ratio;
    const height = img.naturalHeight * ratio;
    const x = (size - width) / 2;
    const y = (size - height) / 2;

    ctx.drawImage(img, x, y, width, height);

    const imageData = ctx.getImageData(0, 0, size, size);
    const data = imageData.data;

    for (let i = 0; i < data.length; i += 4) {
      const r = data[i];
      const g = data[i + 1];
      const bl = data[i + 2];

      const maxC = Math.max(r, g, bl);
      const minC = Math.min(r, g, bl);
      const spread = maxC - minC;
      const brightness = (r + g + bl) / 3;

      // Remove fundo branco/cinza muito claro sem apagar a marca verde.
      if (brightness >= 244 && spread <= 18) {
        data[i + 3] = 0;
      } else if (brightness >= 228 && spread <= 20) {
        const alpha = Math.max(0, Math.min(255, Math.round((244 - brightness) / 16 * 255)));
        data[i + 3] = Math.min(data[i + 3], alpha);
      }
    }

    ctx.putImageData(imageData, 0, 0);

    const link = document.createElement("link");
    link.rel = "icon";
    link.type = "image/png";
    link.sizes = "96x96";
    link.href = canvas.toDataURL("image/png");
    document.head.appendChild(link);
  };

  img.src = "assets/unh-mark.svg?v=20261007-transparent";
})();
