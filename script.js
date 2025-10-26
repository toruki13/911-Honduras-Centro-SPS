(() => {
    const queueListEl = document.getElementById("queueList");
    const queueCountEl = document.getElementById("queueCount");
    const boardBodyEl = document.getElementById("boardBody");
    const boardCountEl = document.getElementById("boardCount");
    const statActiveEl = document.getElementById("statActive");
    const statHoldEl = document.getElementById("statHold");
    const statWrapEl = document.getElementById("statWrap");
    const liveClockEl = document.getElementById("liveClock");

    const callerNameEl = document.getElementById("callerName");
    const callerPhoneEl = document.getElementById("callerPhone");
    const callerAddressEl = document.getElementById("callerAddress");
    const callerStatusEl = document.getElementById("callerStatus");
    const incidentCardEl = document.getElementById("incidentCard");
    const mapLabelEl = document.getElementById("mapLabel");
    const miniMapLabelEl = document.getElementById("miniMapLabel");
    const miniMapMarkerEl = document.getElementById("miniMapMarker");
    const incomingModalEl = document.getElementById("incomingModal");
    const modalWindowEl = incomingModalEl ? incomingModalEl.querySelector(".modal-window") : null;
    const modalTypeEl = document.getElementById("modalType");
    const modalLocationEl = document.getElementById("modalLocation");
    const modalGridEl = document.getElementById("modalGrid");
    const modalNotesEl = document.getElementById("modalNotes");
    const modalAcceptBtn = document.getElementById("modalAccept");
    const modalDeclineBtn = document.getElementById("modalDecline");
    const modalMapMarkerEl = document.getElementById("modalMapMarker");
    const modalMapLabelEl = document.getElementById("modalMapLabel");

    const queue = [];
    const board = [];
    let callSequence = 401;
    let selectedCallId = null;
    let manualModalOpen = false;
    let pendingManualCall = null;
    let glitchEnabled = false;
    const MANUAL_CALL_TYPE = "Person@ S#@#@32r";

    const STORAGE_KEY = "sps911-admin-config";
    const COMMAND_KEY = "sps911-admin-command";

    const configDefaults = {
        spawnIntervalMin: 4200,
        spawnIntervalMax: 6800,
        decisionDelayMin: 2600,
        decisionDelayMax: 6000,
        holdChance: 0.18,
        abandonChance: 0.1,
        holdReleaseMin: 4000,
        holdReleaseMax: 9000,
        wrapMin: 15000,
        wrapMax: 32000,
        wrapClearMin: 5000,
        wrapClearMax: 9000,
        abandonClearMin: 2200,
        abandonClearMax: 4200,
        totalCallSoftCap: 12,
        spawnBiasThreshold: 0.35,
        initialCallsMin: 3,
        initialCallsMax: 5
    };

    const datasetDefaults = {
        callerNames: [
            "Patricia Brotons",
            "Carlos Mejía",
            "Regina Ortez",
            "Alberto Navarro",
            "Kareem Álvarez",
            "Naomi Chen",
            "Javier Salas",
            "Amina Pineda",
            "Damián Ruiz",
            "Rebeca Torres",
            "Georgina Cáceres",
            "María López",
            "Sofía McCarthy",
            "Jalen Fúnez",
            "Elise Céspedes",
            "Everett Quintanilla",
            "Harper Delgado",
            "Camila Castro",
            "Isla Romero",
            "Logan Pineda",
            "Anika Shah",
            "Derek Villeda",
            "Finley Navarro",
            "Cooper Lagos"
        ],
        callTypes: [
            "Incendio Estructural",
            "Emergencia Médica",
            "Incendio Vehicular",
            "Colisión de Tránsito",
            "Violencia Doméstica",
            "Disparo de Alarma",
            "Control Animal",
            "Materiales Peligrosos",
            "Rescate",
            "Asalto",
            "Ruido Excesivo",
            "Robo en Proceso",
            "P$rson@ dE$@9eY7@",
        ],
        streetNames: [
            "Col. Fesitranh",
            "Barrio Medina",
            "Boulevard del Norte",
            "2 Avenida SE",
            "Col. Trejo",
            "Col. Jardines del Valle",
            "Bo. Guamilito",
            "Residencial Los Andes",
            "Col. Satélite",
            "Col. Universidad",
            "Col. López Arellano",
            "Anillo Periférico",
            "Av. Circunvalación",
            "Residencial Villas Mackay",
            "Col. Mackay",
            "Barrio Cabañas",
            "Bo. Río Piedras",
            "Col. Florida",
            "Residencial Campisa",
            "Col. Suyapa"
        ],
        cityNames: [
            "San Pedro Sula",
            "Choloma",
            "Villanueva",
            "La Lima",
            "Puerto Cortés",
            "El Progreso",
            "Santa Cruz de Yojoa",
            "Tela",
            "Potrerillos",
            "Omoa",
            "San Manuel",
            "Santa Rita",
            "Baracoa",
            "San Francisco de Yojoa",
            "Pimienta"
        ],
        notes: [
            "Reportan humo visible en tercer nivel de edificio.",
            "Múltiples vehículos involucrados, persona atrapada.",
            "Denunciante escondida, agresor aún dentro de la vivienda.",
            "Paciente inconsciente, se recomienda uso de DEA.",
            "Cables energizados sobre la calle, tránsito bloqueado.",
            "Rociadores activos, humo moderado, alarma continúa.",
            "Peatón inconsciente sobre la acera, sin respuesta.",
            "Se percibe olor químico luego de explosión en bodega.",
            "Vecinos escuchan gritos, posible arma en escena.",
            "Árbol cayó sobre vivienda tras tormenta reciente."
        ],
        units: [
            "Unidad Rescate 4 • Ambulancia 12",
            "Ambulancia 8 • Batallón 2",
            "Patrulla 21 • Patrulla 24",
            "Rescate 6 • Escalera 3",
            "Patrulla 17 • Supervisor 5",
            "Unidad 7 • Patrulla 9",
            "Ambulancia 5 • Apoyo Aéreo",
            "Unidad 11 • Hazmat 2",
            "Policía 3 • Patrulla 12"
        ],
        grids: [
            "Sector 3 • Cuadrante 17",
            "Sector 5 • Cuadrante 04",
            "Sector 2 • Cuadrante 11",
            "Sector 9 • Cuadrante 33",
            "Sector 4 • Cuadrante 27",
            "Sector 8 • Cuadrante 19",
            "Sector 1 • Cuadrante 09",
            "Sector 6 • Cuadrante 23",
            "Sector 7 • Cuadrante 31"
        ],
        priorities: ["P1", "P2", "P3", "P4", "P5"]
    };

    function loadSettings() {
        let stored = {};
        try {
            const raw = window.localStorage.getItem(STORAGE_KEY);
            stored = raw ? JSON.parse(raw) : {};
        } catch (error) {
            console.warn("No se pudieron cargar los ajustes personalizados.", error);
        }

        const mergedDatasets = { ...datasetDefaults };
        if (stored.datasets) {
            Object.keys(datasetDefaults).forEach((key) => {
                const value = stored.datasets[key];
                if (Array.isArray(value) && value.length > 0) {
                    mergedDatasets[key] = value;
                }
            });
        }

        return {
            ...configDefaults,
            ...stored,
            datasets: mergedDatasets
        };
    }

    let settings = loadSettings();

    function pad(value) {
        return String(value).padStart(2, "0");
    }

    function updateClock() {
        const now = new Date();
        liveClockEl.textContent = `${pad(now.getHours())}:${pad(now.getMinutes())}:${pad(
            now.getSeconds()
        )}`;
    }

    setInterval(updateClock, 1000);
    updateClock();

    function randomInt(min, max) {
        let lower = Number(min);
        let upper = Number(max);
        if (!Number.isFinite(lower) || !Number.isFinite(upper)) {
            return 0;
        }
        if (upper < lower) {
            [lower, upper] = [upper, lower];
        }
        lower = Math.floor(lower);
        upper = Math.floor(upper);
        return Math.floor(Math.random() * (upper - lower + 1)) + lower;
    }

    function randomPick(list, fallback = "Desconocido") {
        if (!Array.isArray(list) || list.length === 0) {
            return fallback;
        }
        return list[Math.floor(Math.random() * list.length)];
    }

    const GLITCH_CHARS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789#@%&?!";

    function randomGlitchText(length) {
        let result = "";
        for (let i = 0; i < length; i += 1) {
            result += GLITCH_CHARS[Math.floor(Math.random() * GLITCH_CHARS.length)];
        }
        return result;
    }

    function formatPhone(num) {
        const digits = String(num).padStart(8, "0");
        return `+504 ${digits.slice(0, 4)}-${digits.slice(4)}`;
    }

    function formatCallTime(timestamp) {
        const date = new Date(timestamp);
        return `${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`;
    }

    function formatDuration(ms) {
        const totalSeconds = Math.max(0, Math.floor(ms / 1000));
        const minutes = Math.floor(totalSeconds / 60);
        const seconds = totalSeconds % 60;
        return `${pad(minutes)}:${pad(seconds)}`;
    }

    function statusLabel(status) {
        switch (status) {
            case "incoming":
                return "Entrante";
            case "hold":
                return "En espera";
            case "wrap":
                return "Cierre";
            case "ended":
                return "Finalizada";
            case "active":
                return "Activa";
            default:
                return status;
        }
    }

    function createCall(overrides = {}) {
        const now = Date.now();
        const data = settings.datasets;
        const streetNumber = randomInt(100, 9800);
        const street = overrides.street ?? `${streetNumber} ${randomPick(data.streetNames)}`;
        const city = overrides.city ?? randomPick(data.cityNames);
        callSequence += 1;

        const base = {
            id: callSequence,
            line: randomInt(301, 460),
            caller: randomPick(data.callerNames),
            phone: formatPhone(randomInt(20000000, 98999999)),
            type: randomPick(data.callTypes),
            street,
            city,
            priority: randomPick(data.priorities),
            grid: randomPick(data.grids),
            notes: randomPick(data.notes),
            units: randomPick(data.units),
            status: "incoming",
            stage: "queue",
            createdAt: now,
            updatedAt: now,
            activeSince: null,
            wrapSince: null,
            justUpdated: true,
            mapX: randomInt(12, 88),
            mapY: randomInt(12, 88)
        };

        return {
            ...base,
            ...overrides
        };
    }

    function findCallById(id) {
        if (id == null) {
            return null;
        }
        return (
            board.find((call) => call.id === id) ||
            queue.find((call) => call.id === id) ||
            null
        );
    }

    function refreshUI() {
        renderQueue();
        renderBoard();
        updateStats();
        ensureSelection();
    }

    function renderQueue() {
        const now = Date.now();
        const fragments = queue
            .map((call) => {
                const wait = formatDuration(now - call.createdAt);
                const classes = ["call-card", call.status];
                if (call.justUpdated) {
                    classes.push("flash");
                }
                if (selectedCallId === call.id) {
                    classes.push("selected");
                }
                return `<article class="${classes.join(" ")}" data-id="${call.id}">
                    <div class="call-info">
                        <span class="call-name">${escapeHTML(call.caller)}</span>
                        <div class="call-meta">
                            <span class="badge">${escapeHTML(call.type)}</span>
                            <span>${escapeHTML(call.city)}</span>
                        </div>
                    </div>
                    <div class="call-right">
                        <div class="call-status">${statusLabel(call.status)}</div>
                        <div class="call-timer">${wait}</div>
                    </div>
                </article>`;
            })
            .join("");

        queueListEl.innerHTML =
            fragments || `<div class="call-placeholder">Sin llamadas en cola</div>`;
        queue.forEach((call) => {
            call.justUpdated = false;
        });
    }

    function renderBoard() {
        const now = Date.now();
        const rows = board
            .map((call) => {
                const classes = [];
                if (selectedCallId === call.id) {
                    classes.push("selected");
                }
                if (call.justUpdated) {
                    classes.push("flash");
                }
                const effectiveEnd =
                    call.status === "wrap"
                        ? call.wrapSince || now
                        : call.activeSince
                        ? now
                        : call.createdAt;
                const length = call.activeSince
                    ? formatDuration(effectiveEnd - call.activeSince)
                    : "00:00";
                return `<tr data-id="${call.id}" class="${classes.join(" ")}">
                    <td>${call.line}</td>
                    <td><span class="status-pill ${call.status}">${statusLabel(call.status)}</span></td>
                    <td>${escapeHTML(call.type)}</td>
                    <td>${escapeHTML(call.street)}, ${escapeHTML(call.city)}</td>
                    <td>${formatCallTime(call.createdAt)}</td>
                    <td>${length}</td>
                    <td>${call.priority}</td>
                </tr>`;
            })
            .join("");

        boardBodyEl.innerHTML =
            rows || `<tr><td colspan="7">Sin llamadas activas</td></tr>`;
        board.forEach((call) => {
            call.justUpdated = false;
        });
    }

    function updateStats() {
        queueCountEl.textContent = queue.length;
        boardCountEl.textContent = board.length;
        statActiveEl.textContent = board.filter((c) => c.status === "active").length;
        statHoldEl.textContent = queue.filter((c) => c.status === "hold").length;
        statWrapEl.textContent = board.filter((c) => c.status === "wrap").length;
    }

    function ensureSelection() {
        const existing = findCallById(selectedCallId);
        const fallback = existing || board[0] || queue[0] || null;
        selectedCallId = fallback ? fallback.id : null;
        updateDetails(fallback);
    }

    function updateDetails(call) {
        if (!call) {
            callerNameEl.textContent = "Esperando llamada…";
            callerPhoneEl.textContent = "—";
            callerAddressEl.textContent = "—";
            callerStatusEl.textContent = "—";
            mapLabelEl.textContent = "Esperando ubicación…";
            updateMiniMap(null);
            incidentCardEl.innerHTML = `
                <div class="incident-title">Sin incidentes activos</div>
                <div class="incident-meta">Los eventos entrantes aparecerán aquí.</div>
            `;
            return;
        }

        callerNameEl.textContent = call.caller;
        callerPhoneEl.textContent = call.phone;
        callerAddressEl.textContent = `${call.street}, ${call.city}`;
        callerStatusEl.textContent = statusLabel(call.status);
        mapLabelEl.textContent = `${call.city} • ${call.grid}`;
        updateMiniMap(call);

        incidentCardEl.innerHTML = `
            <div class="incident-title">${escapeHTML(call.type)} • Prioridad ${escapeHTML(
            call.priority
        )}</div>
            <div class="incident-meta">${escapeHTML(call.street)}, ${escapeHTML(call.city)}</div>
            <div class="incident-grid">
                <div><span class="label">Denunciante</span> ${escapeHTML(call.caller)}</div>
                <div><span class="label">Línea</span> ${call.line}</div>
                <div><span class="label">Estado</span> ${statusLabel(call.status)}</div>
                <div><span class="label">Unidades</span> ${escapeHTML(call.units)}</div>
                <div><span class="label">Cuadrante</span> ${escapeHTML(call.grid)}</div>
                <div><span class="label">Notas</span> ${escapeHTML(call.notes)}</div>
            </div>
        `;
    }

    function updateMiniMap(call) {
        if (!miniMapMarkerEl || !miniMapLabelEl) {
            return;
        }
        if (!call) {
            miniMapMarkerEl.style.opacity = "0";
            miniMapLabelEl.textContent = "Sin selección";
            return;
        }
        const x = typeof call.mapX === "number" ? call.mapX : 50;
        const y = typeof call.mapY === "number" ? call.mapY : 50;
        miniMapMarkerEl.style.left = `${x}%`;
        miniMapMarkerEl.style.top = `${y}%`;
        miniMapMarkerEl.style.opacity = "1";
        const labelParts = [call.city, call.grid].filter(Boolean);
        miniMapLabelEl.textContent = labelParts.join(" • ") || "Sin selección";
    }

    function updateModalMap(call) {
        if (!modalMapMarkerEl || !modalMapLabelEl) {
            return;
        }
        if (!call) {
            modalMapMarkerEl.style.opacity = "0";
            modalMapLabelEl.textContent = "Sin datos";
            return;
        }
        const x = typeof call.mapX === "number" ? call.mapX : 50;
        const y = typeof call.mapY === "number" ? call.mapY : 50;
        modalMapMarkerEl.style.left = `${x}%`;
        modalMapMarkerEl.style.top = `${y}%`;
        modalMapMarkerEl.style.opacity = "1";
        const labelParts = [call.city, call.grid].filter(Boolean);
        modalMapLabelEl.textContent = labelParts.join(" • ") || "Sin datos";
    }

    function syncGlitchState() {
        if (!modalWindowEl) {
            return;
        }
        if (glitchEnabled) {
            modalWindowEl.classList.add("glitch-on");
        } else {
            modalWindowEl.classList.remove("glitch-on");
        }
    }

    function buildGlitchPayload() {
        const chunk = (len) => randomGlitchText(len);
        const street = `${chunk(3)}-${chunk(4)} ${chunk(2)}.Corridor`;
        const city = `Sector ${chunk(2)}${chunk(1)}`;
        const grid = `${chunk(2)}:${chunk(2)}`;
        return {
            caller: `Origen-${chunk(3)}`,
            phone: `+${chunk(3)}-${chunk(4)}${chunk(2)}`,
            street,
            city,
            grid,
            notes: `Señal corrupta ${chunk(4)} ${chunk(3)}`,
            units: `Unidad ${chunk(2)}`
        };
    }

    function handleCommand(rawValue) {
        if (!rawValue) {
            return;
        }
        let command;
        try {
            command = JSON.parse(rawValue);
        } catch (error) {
            console.warn("No se pudo interpretar el comando recibido.", error);
            return;
        }
        switch (command.type) {
            case "spawn":
                spawnCall();
                break;
            case "clearQueue":
                queue.length = 0;
                if (board.length === 0) {
                    selectedCallId = null;
                }
                refreshUI();
                break;
            case "clearBoard":
                board.length = 0;
                if (queue.length === 0) {
                    selectedCallId = null;
                }
                refreshUI();
                break;
            case "resetAll":
                queue.length = 0;
                board.length = 0;
                selectedCallId = null;
                refreshUI();
                break;
            default:
                console.warn("Tipo de comando no reconocido:", command.type);
        }
        window.localStorage.removeItem(COMMAND_KEY);
    }

    function setQueueStatus(call, status) {
        if (!call || call.stage !== "queue") {
            return;
        }
        call.status = status;
        call.updatedAt = Date.now();
        call.justUpdated = true;
        refreshUI();
    }

    function moveToBoard(call) {
        if (!call || call.stage === "board") {
            return;
        }
        const index = queue.indexOf(call);
        if (index !== -1) {
            queue.splice(index, 1);
        }
        call.stage = "board";
        call.status = "active";
        call.activeSince = Date.now();
        call.updatedAt = call.activeSince;
        call.justUpdated = true;
        board.unshift(call);
        scheduleWrap(call);
        refreshUI();
    }

    function concludeCall(call) {
        const idx = board.indexOf(call);
        if (idx !== -1) {
            board.splice(idx, 1);
            if (selectedCallId === call.id) {
                selectedCallId = null;
            }
            refreshUI();
        }
    }

    function scheduleLifecycle(call) {
        const decisionDelay = randomInt(settings.decisionDelayMin, settings.decisionDelayMax);
        setTimeout(() => {
            if (call.stage !== "queue") {
                return;
            }
            const roll = Math.random();
            const holdChance = Math.max(0, Math.min(1, settings.holdChance));
            const abandonChance = Math.max(0, Math.min(1, settings.abandonChance));
            if (roll < holdChance) {
                setQueueStatus(call, "hold");
                const holdDelay = randomInt(settings.holdReleaseMin, settings.holdReleaseMax);
                setTimeout(() => {
                    if (call.stage === "queue" && call.status === "hold") {
                        moveToBoard(call);
                    }
                }, holdDelay);
            } else if (roll < holdChance + abandonChance) {
                setQueueStatus(call, "ended");
                const abandonDelay = randomInt(
                    settings.abandonClearMin,
                    settings.abandonClearMax
                );
                setTimeout(() => {
                    const idx = queue.indexOf(call);
                    if (idx !== -1) {
                        queue.splice(idx, 1);
                        if (selectedCallId === call.id) {
                            selectedCallId = null;
                        }
                        refreshUI();
                    }
                }, abandonDelay);
            } else {
                moveToBoard(call);
            }
        }, decisionDelay);
    }

    function scheduleWrap(call) {
        const wrapDelay = randomInt(settings.wrapMin, settings.wrapMax);
        setTimeout(() => {
            if (call.stage !== "board" || call.status !== "active") {
                return;
            }
            call.status = "wrap";
            call.wrapSince = Date.now();
            call.updatedAt = call.wrapSince;
            call.justUpdated = true;
            refreshUI();

            const clearDelay = randomInt(settings.wrapClearMin, settings.wrapClearMax);
            setTimeout(() => concludeCall(call), clearDelay);
        }, wrapDelay);
    }

    function openManualCallModal() {
        if (
            !incomingModalEl ||
            !modalTypeEl ||
            !modalLocationEl ||
            !modalGridEl ||
            !modalNotesEl ||
            manualModalOpen
        ) {
            return;
        }
        const glitchData = buildGlitchPayload();
        pendingManualCall = createCall({
            caller: glitchData.caller,
            phone: glitchData.phone,
            street: glitchData.street,
            city: glitchData.city,
            grid: glitchData.grid,
            notes: glitchData.notes,
            units: glitchData.units,
            type: MANUAL_CALL_TYPE,
            stage: "manual",
            status: "incoming"
        });
        modalTypeEl.textContent = MANUAL_CALL_TYPE;
        modalLocationEl.textContent = `${glitchData.street}, ${glitchData.city}`;
        modalGridEl.textContent = glitchData.grid;
        modalNotesEl.textContent = glitchData.notes;
        updateModalMap(pendingManualCall);
        glitchEnabled = true;
        incomingModalEl.classList.remove("hidden");
        incomingModalEl.setAttribute("aria-hidden", "false");
        requestAnimationFrame(() => {
            incomingModalEl.classList.add("active");
        });
        syncGlitchState();
        manualModalOpen = true;
    }

    function closeManualCallModal() {
        if (!incomingModalEl || !manualModalOpen) {
            return;
        }
        incomingModalEl.classList.remove("active");
        incomingModalEl.setAttribute("aria-hidden", "true");
        manualModalOpen = false;
        pendingManualCall = null;
        updateModalMap(null);
        glitchEnabled = false;
        syncGlitchState();
        setTimeout(() => {
            if (!manualModalOpen && incomingModalEl) {
                incomingModalEl.classList.add("hidden");
            }
        }, 220);
    }

    function acceptManualCall() {
        if (!pendingManualCall) {
            closeManualCallModal();
            return;
        }
        const call = pendingManualCall;
        call.stage = "queue";
        call.status = "incoming";
        call.createdAt = Date.now();
        call.updatedAt = call.createdAt;
        call.activeSince = null;
        call.wrapSince = null;
        call.justUpdated = true;
        queue.unshift(call);
        selectedCallId = call.id;
        scheduleLifecycle(call);
        refreshUI();
        closeManualCallModal();
    }

    function spawnCall() {
        const call = createCall();
        queue.unshift(call);
        scheduleLifecycle(call);
        refreshUI();
    }

    function escapeHTML(value) {
        return String(value).replace(/[&<>"']/g, (char) => {
            switch (char) {
                case "&":
                    return "&amp;";
                case "<":
                    return "&lt;";
                case ">":
                    return "&gt;";
                case '"':
                    return "&quot;";
                case "'":
                    return "&#39;";
                default:
                    return char;
            }
        });
    }

    boardBodyEl.addEventListener("click", (event) => {
        const row = event.target.closest("tr[data-id]");
        if (!row) {
            return;
        }
        const id = Number(row.dataset.id);
        const call = findCallById(id);
        if (call) {
            selectedCallId = call.id;
            refreshUI();
        }
    });

    queueListEl.addEventListener("click", (event) => {
        const card = event.target.closest(".call-card[data-id]");
        if (!card) {
            return;
        }
        const id = Number(card.dataset.id);
        const call = findCallById(id);
        if (call) {
            selectedCallId = call.id;
            refreshUI();
        }
    });

    if (modalAcceptBtn) {
        modalAcceptBtn.addEventListener("click", acceptManualCall);
    }

    if (modalDeclineBtn) {
        modalDeclineBtn.addEventListener("click", () => {
            closeManualCallModal();
        });
    }

    if (incomingModalEl) {
        incomingModalEl.addEventListener("click", (event) => {
            if (
                event.target === incomingModalEl ||
                (event.target instanceof HTMLElement && event.target.classList.contains("modal-backdrop"))
            ) {
                closeManualCallModal();
            }
        });
    }

    document.addEventListener("keydown", (event) => {
        const isBKey = event.code === "KeyB" || event.key === "b" || event.key === "B";
        if (isBKey && !event.repeat) {
            const modifierActive = event.metaKey || event.ctrlKey || event.altKey;
            if (!modifierActive || event.metaKey || event.ctrlKey) {
                event.preventDefault();
                glitchEnabled = !glitchEnabled;
                syncGlitchState();
                return;
            }
        }
        if (event.code === "KeyG" && event.altKey && !event.repeat) {
            event.preventDefault();
            glitchEnabled = !glitchEnabled;
            syncGlitchState();
            return;
        }
        if (event.code === "Space" && !event.repeat && !manualModalOpen) {
            const target = event.target;
            const tagName = target && target.nodeName;
            if (tagName && ["INPUT", "TEXTAREA", "SELECT"].includes(tagName)) {
                return;
            }
            event.preventDefault();
            openManualCallModal();
        } else if (event.code === "Escape" && manualModalOpen) {
            event.preventDefault();
            closeManualCallModal();
        }
    });

    setInterval(() => {
        refreshUI();
    }, 1000);

    const initialCalls = randomInt(settings.initialCallsMin, settings.initialCallsMax);
    for (let i = 0; i < initialCalls; i += 1) {
        const call = createCall();
        const delay = 800 * i;
        setTimeout(() => {
            queue.unshift(call);
            refreshUI();
            scheduleLifecycle(call);
        }, delay);
    }

    function scheduleNextSpawn() {
        const delay = randomInt(settings.spawnIntervalMin, settings.spawnIntervalMax);
        setTimeout(() => {
            const totalActive = queue.length + board.length;
            const threshold = Math.max(0, Math.min(1, settings.spawnBiasThreshold || 0));
            if (totalActive < settings.totalCallSoftCap || Math.random() > threshold) {
                spawnCall();
            }
            scheduleNextSpawn();
        }, delay);
    }

    window.addEventListener("storage", (event) => {
        if (event.key === STORAGE_KEY) {
            settings = loadSettings();
            refreshUI();
        } else if (event.key === COMMAND_KEY) {
            handleCommand(event.newValue);
        }
    });

    const pendingCommand = window.localStorage.getItem(COMMAND_KEY);
    if (pendingCommand) {
        handleCommand(pendingCommand);
    }

    scheduleNextSpawn();
})();
