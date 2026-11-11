// Mockup-only: a small "Screens" menu for moving between the design mockups. Not part of the product.
(() => {
  const SCREENS = [
    ["d.html", "Home"],
    ["browse.html", "Browse"],
    ["video.html", "Video"],
    ["pay.html", "Payment"],
    ["licence.html", "Your licence"],
    ["certificate.html", "Certificate"],
    ["check.html", "Check a licence"],
    ["upload.html", "Upload"],
    ["library.html", "My library"],
    ["login.html", "Log in"],
    ["signup.html", "Sign up"],
  ];
  const here = location.pathname.split("/").pop() || "d.html";
  document.querySelectorAll("nav.switch").forEach((n) => n.remove());
  const current = (SCREENS.find(([f]) => f === here) || [, "Screens"])[1];
  const box = document.createElement("div");
  box.className = "switch";
  box.innerHTML = `<button type="button" aria-expanded="false">Screens <span>· ${current}</span></button>
    <ul>${SCREENS.map(([f, n]) => `<li><a href="${f}"${f === here ? ' aria-current="page"' : ""}>${n}</a></li>`).join("")}</ul>`;
  const btn = box.querySelector("button");
  btn.addEventListener("click", (e) => { e.stopPropagation(); const open = box.classList.toggle("is-open"); btn.setAttribute("aria-expanded", String(open)); });
  document.addEventListener("click", () => { box.classList.remove("is-open"); btn.setAttribute("aria-expanded", "false"); });
  document.body.appendChild(box);
})();
