(() => {
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

    const timingForm = document.getElementById("timingForm");
    const dataForm = document.getElementById("dataForm");
    const timingStatus = document.getElementById("timingStatus");
    const dataStatus = document.getElementById("dataStatus");
    const resetButton = document.getElementById("resetConfig");
    const commandButtons = Array.from(
        document.querySelectorAll(".actions-grid [data-command]")
    );

    let currentConfig = loadConfig();

    populateTimingForm(currentConfig);
    populateDataForm(currentConfig.datasets);

    timingForm.addEventListener("submit", (event) => {
        event.preventDefault();
        const formData = new FormData(timingForm);
        const updated = { ...currentConfig };
        for (const [key, value] of formData.entries()) {
            if (!value) {
                continue;
            }
            const input = timingForm.querySelector(`[name="${key}"]`);
            const numeric = Number(value);
            if (input?.dataset.scale === "percent") {
                updated[key] = Number.isFinite(numeric) ? numeric / 100 : 0;
            } else {
                updated[key] = Number.isFinite(numeric) ? numeric : 0;
            }
        }
        saveConfig(updated);
        currentConfig = updated;
        showStatus(timingStatus, "Guardado ✓");
    });

    dataForm.addEventListener("submit", (event) => {
        event.preventDefault();
        const formData = new FormData(dataForm);
        const datasets = { ...currentConfig.datasets };
        for (const [key, value] of formData.entries()) {
            const list = value
                .split("\n")
                .map((item) => item.trim())
                .filter(Boolean);
            datasets[key] = list;
        }
        const updated = { ...currentConfig, datasets };
        saveConfig(updated);
        currentConfig = updated;
        showStatus(dataStatus, "Datos actualizados");
    });

    resetButton.addEventListener("click", () => {
        const confirmReset = window.confirm(
            "¿Seguro que deseas restablecer los valores por defecto?"
        );
        if (!confirmReset) {
            return;
        }
        window.localStorage.removeItem(STORAGE_KEY);
        currentConfig = loadConfig();
        populateTimingForm(currentConfig);
        populateDataForm(currentConfig.datasets);
        showStatus(timingStatus, "Restablecido");
        showStatus(dataStatus, "");
    });

    commandButtons.forEach((button) => {
        button.addEventListener("click", () => {
            const type = button.dataset.command;
            dispatchCommand(type);
        });
    });

    function loadConfig() {
        let stored = {};
        try {
            const raw = window.localStorage.getItem(STORAGE_KEY);
            stored = raw ? JSON.parse(raw) : {};
        } catch (error) {
            console.warn("No se pudo leer la configuración guardada.", error);
        }
        const datasets = { ...datasetDefaults };
        if (stored.datasets) {
            Object.keys(datasetDefaults).forEach((key) => {
                const value = stored.datasets[key];
                if (Array.isArray(value) && value.length > 0) {
                    datasets[key] = value;
                }
            });
        }
        return {
            ...configDefaults,
            ...stored,
            datasets
        };
    }

    function saveConfig(config) {
        try {
            window.localStorage.setItem(
                STORAGE_KEY,
                JSON.stringify({
                    ...config,
                    datasets: config.datasets
                })
            );
        } catch (error) {
            console.error("No se pudo guardar la configuración.", error);
        }
    }

    function populateTimingForm(config) {
        const entries = Object.entries(configDefaults);
        entries.forEach(([key]) => {
            const input = timingForm.querySelector(`[name="${key}"]`);
            if (!input) {
                return;
            }
            if (input.dataset.scale === "percent") {
                input.value = Math.round((config[key] ?? 0) * 100);
            } else {
                input.value = config[key] ?? configDefaults[key];
            }
        });
    }

    function populateDataForm(datasets) {
        Object.entries(datasetDefaults).forEach(([key]) => {
            const textarea = dataForm.querySelector(`[name="${key}"]`);
            if (!textarea) {
                return;
            }
            textarea.value = (datasets[key] ?? datasetDefaults[key]).join("\n");
        });
    }

    function showStatus(element, message) {
        if (!element) {
            return;
        }
        element.textContent = message;
        if (!message) {
            return;
        }
        setTimeout(() => {
            if (element.textContent === message) {
                element.textContent = "";
            }
        }, 2200);
    }

    function dispatchCommand(type) {
        if (!type) {
            return;
        }
        const payload = {
            type,
            issuedAt: Date.now(),
            token: Math.random().toString(36).slice(2)
        };
        try {
            window.localStorage.setItem(COMMAND_KEY, JSON.stringify(payload));
        } catch (error) {
            console.error("No se pudo enviar el comando administrativo.", error);
        }
    }
})();
