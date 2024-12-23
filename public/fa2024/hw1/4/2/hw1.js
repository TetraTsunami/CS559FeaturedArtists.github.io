var canvas = document.getElementById('deez');
var nStartAngle_ref = document.getElementById('nStartAngle');
var nPercentage_ref = document.getElementById('nPercentage');
var nPoints_ref = document.getElementById('nPoints');
var nRadius_ref = document.getElementById('nRadius');
var strColor_ref = document.getElementById('strColor');
var bRainbow_ref = document.getElementById('bRainbow');
var bRainbow2_ref = document.getElementById('bRainbow2');
var bOutline_ref = document.getElementById('bOutline');
var strOutlineColor_ref = document.getElementById('strOutlineColor');

function draw() {
    let context = canvas.getContext('2d');
    canvas.width = canvas.width;
    let nPercentage = Number(nPercentage_ref.value);
    let nStartAngle = Number(nStartAngle_ref.value);
    let nPoints = Number(nPoints_ref.value);
    let nRadius = Number(nRadius_ref.value);
    let strColor = strColor_ref.value;
    let strOutlineColor = strOutlineColor_ref.value;
    let bRainbow = Boolean(bRainbow_ref.checked);
    let bRainbow2 = Boolean(bRainbow2_ref.checked);
    let bOutline = Boolean(bOutline_ref.checked);

    function clamp(min, max, num) {
        return Math.max(Math.min(max, num), min);
    }

    // Yes, I wrote this myself 4 years ago
    function HSV2RGB(h, s, v) {
        let r, g, b, i, f, p, q, t;

        i = Math.floor(h * 6);
        f = h * 6 - i;
        p = v * (1 - s);
        q = v * (1 - f * s);
        t = v * (1 - (1 - f) * s);

        switch (i % 6) {
            case 0:
                r = v,
                    g = t,
                    b = p;
                break;
            case 1:
                r = q,
                    g = v,
                    b = p;
                break;
            case 2:
                r = p,
                    g = v,
                    b = t;
                break;
            case 3:
                r = p,
                    g = q,
                    b = v;
                break;
            case 4:
                r = t,
                    g = p,
                    b = v;
                break;
            case 5:
                r = v,
                    g = p,
                    b = q;
                break;
        }

        const red = Math.round(r * 255);
        const green = Math.round(g * 255);
        const blue = Math.round(b * 255);

        return `rgb(${red}, ${green}, ${blue})`;
    }

    function drawCircle(nStartAngle, nPrecision, nRadius, strColor, bOutline, strOutlineColor, bRainbow2) {
        if (nPrecision < 3) return;
        context.save();
        context.fillStyle = strColor;
        context.beginPath();
        let nDegree = 360;
        let nIncrementAngle = nDegree / nPrecision;
        let nEndAngle = nStartAngle + (nPrecision - 1) * nIncrementAngle;

        context.moveTo(Math.cos(nStartAngle * Math.PI / 180) * nRadius, Math.sin(nStartAngle * Math.PI / 180) * nRadius);

        for (let i = nStartAngle + nIncrementAngle; i < nEndAngle + 0.1; i += nIncrementAngle) {
            context.lineTo(Math.cos(i * Math.PI / 180) * nRadius, Math.sin(i * Math.PI / 180) * nRadius);
        }

        context.closePath();
        context.fill();
        context.restore();

        if (bOutline) {
            drawRainbowArc(nStartAngle, nPercentage, nPrecision, nRadius, strOutlineColor, bRainbow2);
        }
    }

    function drawRainbowSector(nStartAngle, nPercentage, nPrecision, nRadius, strColor, bRainbow, bOutline, strOutlineColor, bRainbow2) {
        if (nPrecision < 3) return;
        if (nPercentage < 0.001) return;
        context.save();
        let nDegree = clamp(0, 1, nPercentage) * 360;
        let nIncrementAngle = nDegree / nPrecision;

        let nEndAngle = nStartAngle + (nPrecision - 1) * nIncrementAngle;
        for (let i = nStartAngle; i < nEndAngle + 0.05; i += nIncrementAngle) {
            context.beginPath();
            context.fillStyle = bRainbow ? HSV2RGB((i - nStartAngle) / 360, 1, 1) : strColor;
            context.moveTo(0, 0)
            context.lineTo(Math.cos(i * Math.PI / 180) * nRadius, Math.sin(i * Math.PI / 180) * nRadius);
            context.lineTo(Math.cos((i + nIncrementAngle) * Math.PI / 180) * nRadius, Math.sin((i + nIncrementAngle) * Math.PI / 180) * nRadius);
            context.closePath();
            context.fill();
        }

        if (bOutline) {
            drawRainbowArc(nStartAngle, nPercentage, nPrecision, nRadius, strOutlineColor, bRainbow2);
            if (nPercentage !== 1){
                context.strokeStyle = bRainbow2 ? HSV2RGB(0, 1, 1) : strOutlineColor;
                context.beginPath();
                context.moveTo(Math.cos(nStartAngle * Math.PI / 180) * nRadius, Math.sin(nStartAngle * Math.PI / 180) * nRadius);
                context.lineTo(0, 0);
                context.closePath();
                context.stroke();

                context.strokeStyle = bRainbow2 ? HSV2RGB(nDegree / 360, 1, 1) : strOutlineColor;
                context.beginPath();
                context.moveTo(0, 0);
                context.lineTo(Math.cos((nStartAngle + nDegree) * Math.PI / 180) * nRadius, Math.sin((nStartAngle + nDegree) * Math.PI / 180) * nRadius);
                context.closePath();
                context.stroke();
            }
        }

        context.restore();
    }

    function drawRainbowArc(nStartAngle, nPercentage, nPrecision, nRadius, strColor, bRainbow) {
        if (nPrecision < 3) return;
        if (nPercentage < 0.001) return;
        context.save();
        let nDegree = clamp(0, 1, nPercentage) * 360;
        let nIncrementAngle = nDegree / nPrecision;

        let nEndAngle = nStartAngle + (nPrecision - 1) * nIncrementAngle;

        for (let i = nStartAngle; i < nEndAngle + 0.05; i += nIncrementAngle) {
            context.beginPath();
            context.strokeStyle = bRainbow ? HSV2RGB((i - nStartAngle) / 360, 1, 1) : strColor;
            context.moveTo(Math.cos(i * Math.PI / 180) * nRadius, Math.sin(i * Math.PI / 180) * nRadius);
            context.lineTo(Math.cos((i + nIncrementAngle) * Math.PI / 180) * nRadius, Math.sin((i + nIncrementAngle) * Math.PI / 180) * nRadius);
            context.closePath();
            context.stroke();
        }

        context.restore();
    }

    context.translate(256, 256);

    if (bRainbow || nPercentage !== 1) {
        drawRainbowSector(nStartAngle, nPercentage, nPoints, nRadius, strColor, bRainbow, bOutline, strOutlineColor, bRainbow2);
    } else {
        drawCircle(nStartAngle, nPoints, nRadius, strColor, bOutline, strOutlineColor, bRainbow2);
    }

}

nPercentage_ref.addEventListener("input", draw);
nStartAngle_ref.addEventListener("input", draw);
nPoints_ref.addEventListener("input", draw);
nRadius_ref.addEventListener("input", draw);
strColor_ref.addEventListener("input", draw);
strOutlineColor_ref.addEventListener("input", draw);
bRainbow_ref.addEventListener("input", draw);
bRainbow2_ref.addEventListener("input", draw);
bOutline_ref.addEventListener("input", draw);
draw();