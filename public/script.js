//==================================================
// CONFIGURAÇÃO
//==================================================

// Se usar backend, deixe null.
// O servidor responderá com a data final.
const USE_SERVER_TIME = true;

// Caso não utilize backend ainda,
// altere para false e coloque a data abaixo.
const LOCAL_TARGET = new Date("2026-07-27T18:27:00Z");

let targetDate = null;
let serverOffset = 0;
let countdownFinished = false;

//==================================================
// ELEMENTOS
//==================================================

const loading = document.getElementById("loading");

const title = document.getElementById("title");

const countdown = document.getElementById("countdown");

const finished = document.getElementById("finished");

const continueButton = document.getElementById("continueButton");

const particles = document.getElementById("particles");

const daysElement = document.getElementById("days");

const hoursElement = document.getElementById("hours");

const minutesElement = document.getElementById("minutes");

const secondsElement = document.getElementById("seconds");

//==================================================
// UTILIDADES
//==================================================

function pad(number)
{
    return String(number).padStart(2, "0");
}

function sleep(ms)
{
    return new Promise(resolve => setTimeout(resolve, ms));
}

function serverNow()
{
    return new Date(Date.now() + serverOffset);
}

//==================================================
// CARREGAMENTO
//==================================================

window.addEventListener("load", async () =>
{

    await initialize();

    loading.style.opacity = "0";

    setTimeout(() =>
    {

        loading.remove();

    }, 800);

});

//==================================================
// INICIALIZAÇÃO
//==================================================

async function initialize()
{

    if (USE_SERVER_TIME)
    {

        try
        {

            const response = await fetch("/api/time");

            if (!response.ok)
                throw new Error();

            const json = await response.json();

            targetDate = new Date(json.target);

            serverOffset =
                new Date(json.now).getTime()
                -
                Date.now();

        }
        catch
        {

            console.warn("Servidor indisponível.");

            targetDate = LOCAL_TARGET;

        }

    }
    else
    {

        targetDate = LOCAL_TARGET;

    }

    createParticles();

    updateCountdown();

    setInterval(updateCountdown, 1000);

}

//==================================================
// CONTADOR
//==================================================

function updateCountdown()
{

    if (countdownFinished)
        return;

    const now =
        USE_SERVER_TIME
        ?
        serverNow()
        :
        new Date();

    let difference =
        targetDate.getTime()
        -
        now.getTime();

    if (difference <= 0)
    {

        difference = 0;

        finishCountdown();

        return;

    }

    const totalSeconds =
        Math.floor(difference / 1000);

    const days =
        Math.floor(totalSeconds / 86400);

    const hours =
        Math.floor((totalSeconds % 86400) / 3600);

    const minutes =
        Math.floor((totalSeconds % 3600) / 60);

    const seconds =
        totalSeconds % 60;

    updateNumber(daysElement, pad(days));

    updateNumber(hoursElement, pad(hours));

    updateNumber(minutesElement, pad(minutes));

    updateNumber(secondsElement, pad(seconds));

}

//==================================================
// ANIMAÇÃO DOS NÚMEROS
//==================================================

function updateNumber(element, value)
{

    if (element.textContent === value)
        return;

    element.animate(
    [

        {

            opacity: .35,

            transform: "translateY(-8px)"

        },

        {

            opacity: 1,

            transform: "translateY(0px)"

        }

    ],
    {

        duration: 220,

        easing: "ease-out"

    });

    element.textContent = value;

}

//==================================================
// FINALIZAÇÃO
//==================================================

async function finishCountdown()
{

    if (countdownFinished)
        return;

    countdownFinished = true;

    daysElement.textContent = "00";
    hoursElement.textContent = "00";
    minutesElement.textContent = "00";
    secondsElement.textContent = "00";

    countdown.classList.add("fadeOut");

    await sleep(1200);

    countdown.style.display = "none";

    finished.style.display = "block";

    requestAnimationFrame(() =>
    {

        finished.style.opacity = "1";

    });

}

//==================================================
// BOTÃO
//==================================================

continueButton.addEventListener("click", async () =>
{

    continueButton.disabled = true;

    continueButton.style.opacity = ".5";

    try
    {

        const response =
            await fetch("/continue",
            {
                method: "POST"
            });

        if (response.redirected)
        {

            location.href = response.url;

            return;

        }

        if (!response.ok)
            throw new Error();

        const json =
            await response.json();

        if (json.redirect)
        {

            location.href =
                json.redirect;

            return;

        }

        alert("No redirect received.");

    }
    catch
    {

        alert("Unable to connect to server.");

        continueButton.disabled = false;

        continueButton.style.opacity = "1";

    }

});

//==================================================
// PARTÍCULAS
//==================================================

function createParticles()
{

    setInterval(() =>
    {

        spawnParticle();

    }, 180);

}

function spawnParticle()
{

    const particle =
        document.createElement("div");

    particle.className = "ash";

    const size =
        Math.random() * 2 + 1;

    particle.style.width =
        size + "px";

    particle.style.height =
        size + "px";

    particle.style.left =
        Math.random() * 100 + "vw";

    particle.style.top =
        "105vh";

    particle.style.opacity =
        Math.random() * .5 + .15;

    particle.style.animationDuration =
        (8 + Math.random() * 10) + "s";

    particle.style.filter =
        "blur(" + (Math.random() * 1.4) + "px)";

    particle.style.transform =
        "translateX(" +
        ((Math.random() * 50) - 25) +
        "px)";

    particles.appendChild(particle);

    particle.addEventListener("animationend", () =>
    {

        particle.remove();

    });

}

//==================================================
// LEVE PULSO NO TÍTULO
//==================================================

setInterval(() =>
{

    title.animate(
    [

        {

            opacity: .82,
            letterSpacing: "3px"

        },

        {

            opacity: 1,
            letterSpacing: "4px"

        },

        {

            opacity: .9,
            letterSpacing: "3px"

        }

    ],
    {

        duration: 5000,
        easing: "ease-in-out"

    });

}, 5000);

//==================================================
// PAUSAR ANIMAÇÕES QUANDO ABA NÃO ESTÁ VISÍVEL
//==================================================

document.addEventListener("visibilitychange", () =>
{

    if (!document.hidden)
    {

        updateCountdown();

    }

});

//==================================================
// EFEITO SUTIL NOS NÚMEROS
//==================================================

setInterval(() =>
{

    if (countdownFinished)
        return;

    const numbers =
        document.querySelectorAll(".number");

    numbers.forEach(number =>
    {

        number.animate(
        [

            {

                transform:
                "translateY(0px)",

                opacity: 1

            },

            {

                transform:
                "translateY(-1px)",

                opacity: .96

            },

            {

                transform:
                "translateY(0px)",

                opacity: 1

            }

        ],
        {

            duration: 2500 +
            Math.random() * 2000,

            easing:
            "ease-in-out"

        });

    });

}, 2500);

//==================================================
// PARALLAX SUAVE
//==================================================

document.addEventListener("mousemove", e =>
{

    const background =
        document.getElementById("background");

    const x =
        (e.clientX / window.innerWidth - .5) * 8;

    const y =
        (e.clientY / window.innerHeight - .5) * 8;

    background.style.transform =
        `translate(${x}px, ${y}px) scale(1.08)`;

});

//==================================================
// PRELOAD DA IMAGEM
//==================================================

const preload =
new Image();

preload.src =
"background.jpg";

//==================================================
// DEBUG (desative quando publicar)
//==================================================

// finishCountdown();