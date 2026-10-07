(() => {
  const link = document.querySelector('link[rel="icon"]') || document.createElement("link");
  link.rel = "icon";
  link.type = "image/png";

  const img = new Image();
  img.onload = () => {
    const canvas = document.createElement("canvas");
    canvas.width = 64;
    canvas.height = 64;
    const ctx = canvas.getContext("2d");

    const padding = 7;
    const max = 64 - padding * 2;
    const ratio = Math.min(max / img.naturalWidth, max / img.naturalHeight);
    const width = img.naturalWidth * ratio;
    const height = img.naturalHeight * ratio;
    const x = (64 - width) / 2;
    const y = (64 - height) / 2;

    ctx.clearRect(0, 0, 64, 64);
    ctx.drawImage(img, x, y, width, height);
    link.href = canvas.toDataURL("image/png");

    if (!link.parentNode) document.head.appendChild(link);
  };
  img.src = "assets/unh-mark.svg";
})();
