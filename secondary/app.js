// ============================================================
// BUDGET DASHBOARD - MINIMAL VERSION
// ============================================================

const STORAGE_KEY = "budgetDashboard";

let budget = {
    income: [],
    payments: [],
    oneOffPayments: [],
    settings: {
        schedule: "Fortnightly",
        anchorDate: ""
    }
};

let profiles = {};

let currentProfile = "My Budget";

let editingType = null;
let editingId = null;

let calendarDate = new Date();


// ============================================================
// DOM ELEMENTS
// ============================================================

const pages = document.querySelectorAll(".page");
const navButtons = document.querySelectorAll(".nav-btn");

const pageTitle = document.getElementById("pageTitle");
const currentDate = document.getElementById("currentDate");

const monthlyIncome = document.getElementById("monthlyIncome");
const monthlyPayments = document.getElementById("monthlyPayments");
const remainingIncome = document.getElementById("remainingIncome");
const nextIncome = document.getElementById("nextIncome");

const incomePeriodLabel =
    document.getElementById("incomePeriodLabel");

const paymentsPeriodLabel =
    document.getElementById("paymentsPeriodLabel");
	
const upcomingPayments =
    document.getElementById("upcomingPayments");

const currentBudgetPeriod =
    document.getElementById("currentBudgetPeriod");
	
const incomeTable =
    document.getElementById("incomeTable");

const paymentTable =
    document.getElementById("paymentTable");

const addIncomeBtn =
    document.getElementById("addIncomeBtn");

const addPaymentBtn =
    document.getElementById("addPaymentBtn");

const addOneOffBtn =
    document.getElementById("addOneOffBtn");

const oneOffTable =
    document.getElementById("oneOffTable");
	
const modal =
    document.getElementById("modal");

const modalTitle =
    document.getElementById("modalTitle");

const itemForm =
    document.getElementById("itemForm");

const itemName =
    document.getElementById("itemName");

const itemAmount =
    document.getElementById("itemAmount");

const itemFrequency =
    document.getElementById("itemFrequency");

const frequencyGroup =
    document.getElementById("frequencyGroup");
	
const itemDate =
    document.getElementById("itemDate");

const itemDateLabel =
    document.getElementById("itemDateLabel");
	
const cancelBtn =
    document.getElementById("cancelBtn");

const calendarGrid =
    document.getElementById("calendarGrid");

const calendarMonth =
    document.getElementById("calendarMonth");

const previousMonth =
    document.getElementById("previousMonth");

const nextMonth =
    document.getElementById("nextMonth");

const budgetSchedule =
    document.getElementById("budgetSchedule");

const budgetAnchorDate =
    document.getElementById("budgetAnchorDate");
	
const profileSelector =
    document.getElementById("profileSelector");	
	
// ============================================================
// STARTUP
// ============================================================

function startApp() {

    loadData();

    setupEvents();

    updateRecurringDates();

    updateCurrentDate();

    updateScheduleSelector();

    renderAll();

}

if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", startApp);
} else {
    startApp();
}


// ============================================================
// EVENTS
// ============================================================

function setupEvents() {

    // Navigation
    navButtons.forEach(button => {

        button.addEventListener("click", () => {

            showPage(button.dataset.page);

        });

    });

    // Add Income
    if (addIncomeBtn) {

        addIncomeBtn.addEventListener("click", () => {

            openModal("income");

        });

    }

    // Add Payment
    if (addPaymentBtn) {

        addPaymentBtn.addEventListener("click", () => {

            openModal("payment");

        });

    }

	// Add One-Off Payment
	if (addOneOffBtn) {

		addOneOffBtn.addEventListener("click", () => {

			openModal("oneoff");

		});

	}
	
	// Budget Schedule
	if (budgetSchedule) {

		budgetSchedule.addEventListener(
        "change",
        () => {

            budget.settings.schedule =
                budgetSchedule.value;

            saveData();

            renderAll();

        }
    );

}

// Budget Anchor Date
if (budgetAnchorDate) {

    budgetAnchorDate.addEventListener(
        "change",
        () => {

            budget.settings.anchorDate =
                budgetAnchorDate.value;

            saveData();

            renderAll();

        }
    );

}

    // Save form
    if (itemForm) {

        itemForm.addEventListener(
            "submit",
            saveItem
        );

    }

    // Cancel
    if (cancelBtn) {

        cancelBtn.addEventListener(
            "click",
            closeModal
        );

    }

    // Calendar previous
    if (previousMonth) {

        previousMonth.addEventListener(
            "click",
            () => {

                calendarDate.setMonth(
                    calendarDate.getMonth() - 1
                );

                renderCalendar();

            }
        );

    }

    // Calendar next
    if (nextMonth) {

        nextMonth.addEventListener(
            "click",
            () => {

                calendarDate.setMonth(
                    calendarDate.getMonth() + 1
                );

                renderCalendar();

            }
        );

    }

    // Close modal when clicking outside
    if (modal) {

        modal.addEventListener(
            "click",
            event => {

                if (event.target === modal) {

                    closeModal();

                }

            }
        );

    }

}


// ============================================================
// STORAGE
// ============================================================

function saveData() {

    const storageData = {
        activeProfileId: activeProfileId,
        profiles: profiles
    };

    localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify(storageData)
    );

}

function loadData() {

    const saved =
        localStorage.getItem(STORAGE_KEY);


    // ========================================================
    // NO SAVED DATA
    // ========================================================

    if (!saved) {

        const newProfile = {

            id: generateId(),

            name: "My Budget",

            budget: {

                income: [],

                payments: [],

                oneOffPayments: [],

                settings: {

                    schedule: "Fortnightly",

                    anchorDate: ""

                }

            }

        };


        profiles = [newProfile];

        activeProfileId =
            newProfile.id;

        budget =
            newProfile.budget;

        saveData();

        return;

    }


    // ========================================================
    // LOAD SAVED DATA
    // ========================================================

    try {

        const data =
            JSON.parse(saved);


        // ====================================================
        // NEW PROFILE FORMAT
        // ====================================================

        if (
            Array.isArray(data.profiles)
        ) {

            profiles =
                data.profiles;


            activeProfileId =
                data.activeProfileId;


            // Make sure there is always at least
            // one profile

            if (profiles.length === 0) {

                const newProfile = {

                    id: generateId(),

                    name: "My Budget",

                    budget: {

                        income: [],

                        payments: [],

                        oneOffPayments: [],

                        settings: {

                            schedule:
                                "Fortnightly",

                            anchorDate: ""

                        }

                    }

                };


                profiles.push(
                    newProfile
                );

                activeProfileId =
                    newProfile.id;

            }


            // Make sure active profile exists

            let activeProfile =
                profiles.find(
                    profile =>
                        profile.id ===
                        activeProfileId
                );


            if (!activeProfile) {

                activeProfile =
                    profiles[0];

                activeProfileId =
                    activeProfile.id;

            }


            budget =
                activeProfile.budget;


            // Safety checks

            if (!Array.isArray(budget.income)) {

                budget.income = [];

            }


            if (!Array.isArray(budget.payments)) {

                budget.payments = [];

            }


            if (
                !Array.isArray(
                    budget.oneOffPayments
                )
            ) {

                budget.oneOffPayments = [];

            }


            if (!budget.settings) {

                budget.settings = {};

            }


            if (!budget.settings.schedule) {

                budget.settings.schedule =
                    "Fortnightly";

            }


            if (!budget.settings.anchorDate) {

                budget.settings.anchorDate =
                    "";

            }


            return;

        }


        // ====================================================
        // OLD FORMAT
        // ====================================================
        //
        // This is the important migration section.
        //
        // Your current budget is stored directly as:
        //
        // {
        //     income: [],
        //     payments: [],
        //     oneOffPayments: [],
        //     settings: {}
        // }
        //
        // We automatically turn that into
        // the first profile.
        // ====================================================

        const migratedBudget = {

            income:
                Array.isArray(data.income)
                    ? data.income
                    : [],

            payments:
                Array.isArray(data.payments)
                    ? data.payments
                    : [],

            oneOffPayments:
                Array.isArray(
                    data.oneOffPayments
                )
                    ? data.oneOffPayments
                    : [],

            settings: {

                schedule:
                    data.settings &&
                    data.settings.schedule
                        ? data.settings.schedule
                        : "Fortnightly",

                anchorDate:
                    data.settings &&
                    data.settings.anchorDate
                        ? data.settings.anchorDate
                        : ""

            }

        };


        const newProfile = {

            id: generateId(),

            name: "My Budget",

            budget:
                migratedBudget

        };


        profiles = [
            newProfile
        ];


        activeProfileId =
            newProfile.id;


        budget =
            newProfile.budget;


        saveData();


        console.log(
            "Existing budget migrated to profile system."
        );


    } catch (error) {

        console.error(
            "Could not load saved budget data:",
            error
        );


        const newProfile = {

            id: generateId(),

            name: "My Budget",

            budget: {

                income: [],

                payments: [],

                oneOffPayments: [],

                settings: {

                    schedule:
                        "Fortnightly",

                    anchorDate:
                        ""

                }

            }

        };


        profiles = [
            newProfile
        ];


        activeProfileId =
            newProfile.id;


        budget =
            newProfile.budget;

    }

}

function updateScheduleSelector() {

    if (budgetSchedule) {

        budgetSchedule.value =
            budget.settings.schedule ||
            "Fortnightly";

    }

    if (budgetAnchorDate) {

        budgetAnchorDate.value =
            budget.settings.anchorDate || "";

    }

}



// ============================================================
// NAVIGATION
// ============================================================

function showPage(page) {

    pages.forEach(section => {

        section.classList.remove("active");

    });


    const selectedPage =
        document.getElementById(page);

    if (selectedPage) {

        selectedPage.classList.add("active");

    }


    navButtons.forEach(button => {

        button.classList.remove("active");

        if (button.dataset.page === page) {

            button.classList.add("active");

        }

    });


    pageTitle.textContent =
        page === "payments"
            ? "Recurring Payments"
            : page.charAt(0).toUpperCase() + page.slice(1);


    if (page === "calendar") {

        renderCalendar();

    }

}


// ============================================================
// MODAL
// ============================================================

function openModal(type, id = null) {

    editingType = type;
    editingId = id;

    itemForm.reset();

    // Show/hide frequency depending on item type
    if (type === "oneoff") {

    frequencyGroup.style.display = "none";

    itemDateLabel.textContent = "Date";

    modalTitle.textContent = id
        ? "Edit One-Off Payment"
        : "Add One-Off Payment";

} else {

    frequencyGroup.style.display = "flex";

    itemDateLabel.textContent = "Next Date";

    modalTitle.textContent =
        type === "income"
            ? "Add Income"
            : "Add Payment";

}


    // Editing existing item
    if (id) {

        let collection;

        if (type === "income") {

            collection = budget.income;

        } else if (type === "payment") {

            collection = budget.payments;

        } else if (type === "oneoff") {

            collection = budget.oneOffPayments;

        }


        const item =
            collection.find(
                entry => entry.id === id
            );


        if (!item) {

            console.error(
                "Could not find item:",
                type,
                id
            );

            return;

        }


        itemName.value =
            item.name;

        itemAmount.value =
            item.amount;

        itemDate.value =
            item.nextDate;


        // Frequency only exists on recurring items
        if (type !== "oneoff") {

            itemFrequency.value =
                item.frequency;

        }

    } else {

        // New item
        itemDate.value =
            getTodayString();

    }


    modal.classList.remove("hidden");

}


function closeModal() {

    modal.classList.add("hidden");

    editingType = null;
    editingId = null;

}


// ============================================================
// ADD / EDIT
// ============================================================

function saveItem(event) {

    event.preventDefault();

    console.log("SAVE BUTTON PRESSED");

    const name =
        itemName.value.trim();

    const amount =
        Number(itemAmount.value);

    const frequency =
        itemFrequency.value;

    const date =
        itemDate.value;


    console.log("Form values:", {

        name,
        amount,
        frequency,
        date,
        editingType,
        editingId

    });


    // ========================================================
    // VALIDATION
    // ========================================================

    if (!name) {

        alert("Please enter a name.");

        return;

    }


    if (isNaN(amount) || amount < 0) {

        alert("Please enter a valid amount.");

        return;

    }


    if (!date) {

        alert("Please select a date.");

        return;

    }


    // Frequency is only required for recurring items

    if (
        editingType !== "oneoff" &&
        !frequency
    ) {

        alert("Please select a frequency.");

        return;

    }


    // ========================================================
    // ONE-OFF PAYMENT
    // ========================================================

    if (editingType === "oneoff") {

        if (!Array.isArray(budget.oneOffPayments)) {

            budget.oneOffPayments = [];

        }


        const item = {

            id:
                editingId ||
                generateId(),

            name:
                name,

            amount:
                amount,

            nextDate:
                date

        };


        if (editingId) {

            const index =
                budget.oneOffPayments.findIndex(
                    entry =>
                        entry.id === editingId
                );


            if (index === -1) {

                alert(
                    "Could not find the one-off payment you're editing."
                );

                return;

            }


            budget.oneOffPayments[index] =
                item;

        } else {

            budget.oneOffPayments.push(item);

        }


        saveData();

        renderAll();

        closeModal();

        console.log(
            "One-off payment saved successfully."
        );

        return;

    }


    // ========================================================
    // RECURRING ITEMS
    // ========================================================

    if (editingType === "income") {

        if (!Array.isArray(budget.income)) {

            budget.income = [];

        }

    } else if (editingType === "payment") {

        if (!Array.isArray(budget.payments)) {

            budget.payments = [];

        }

    } else {

        console.error(
            "Invalid editingType:",
            editingType
        );

        alert(
            "Something went wrong. Please close the window and try again."
        );

        return;

    }


    const item = {

        id:
            editingId ||
            generateId(),

        name:
            name,

        amount:
            amount,

        frequency:
            frequency,

        nextDate:
            date

    };


    const collection =
        editingType === "income"
            ? budget.income
            : budget.payments;


    if (editingId) {

        const index =
            collection.findIndex(
                entry =>
                    entry.id === editingId
            );


        if (index === -1) {

            alert(
                "Could not find the item you're editing."
            );

            return;

        }


        collection[index] =
            item;

    } else {

        collection.push(item);

    }


    saveData();

    renderAll();

    closeModal();

    console.log(
        "Item saved successfully."
    );

}


// ============================================================
// DELETE
// ============================================================

function deleteItem(type, id) {

    let message;

    if (type === "income") {

        message = "Delete this income?";

    } else if (type === "payment") {

        message = "Delete this payment?";

    } else if (type === "oneoff") {

        message = "Delete this one-off payment?";

    }


    if (!confirm(message)) {

        return;

    }


    if (type === "income") {

        budget.income =
            budget.income.filter(
                item =>
                    item.id !== id
            );

    } else if (type === "payment") {

        budget.payments =
            budget.payments.filter(
                item =>
                    item.id !== id
            );

    } else if (type === "oneoff") {

        budget.oneOffPayments =
            budget.oneOffPayments.filter(
                item =>
                    item.id !== id
            );

    }


    saveData();

    renderAll();

}


// ============================================================
// MARK PAYMENT PAID
// ============================================================

function markPaid(id) {

    const payment =
        budget.payments.find(
            item => item.id === id
        );


    if (!payment) {

        return;

    }


    payment.nextDate =
        calculateNextDate(
            payment.nextDate,
            payment.frequency
        );


    saveData();

    renderAll();

}


// ============================================================
// RECURRING DATE LOGIC
// ============================================================

function updateRecurringDates() {

    let changed = false;


    budget.income.forEach(item => {

        const next =
            calculateNextDate(
                item.nextDate,
                item.frequency
            );

        if (next !== item.nextDate) {

            item.nextDate = next;

            changed = true;

        }

    });


    budget.payments.forEach(item => {

        const next =
            calculateNextDate(
                item.nextDate,
                item.frequency
            );

        if (next !== item.nextDate) {

            item.nextDate = next;

            changed = true;

        }

    });


    if (changed) {

        saveData();

    }

}


function calculateNextDate(
    dateString,
    frequency
) {

    if (!dateString) {

        return getTodayString();

    }


    const date =
        new Date(dateString + "T00:00:00");

    const today =
        new Date();

    today.setHours(0, 0, 0, 0);


    while (date < today) {

        switch (frequency) {

            case "Weekly":

                date.setDate(
                    date.getDate() + 7
                );

                break;


            case "Fortnightly":

                date.setDate(
                    date.getDate() + 14
                );

                break;


            case "Monthly":

                date.setMonth(
                    date.getMonth() + 1
                );

                break;


            case "Quarterly":

                date.setMonth(
                    date.getMonth() + 3
                );

                break;


            case "Yearly":

                date.setFullYear(
                    date.getFullYear() + 1
                );

                break;


            default:

                return dateString;

        }

    }


    return formatDateForInput(date);

}


// ============================================================
// RENDER EVERYTHING
// ============================================================

function renderAll() {

    renderIncome();

    renderPayments();

    renderOneOffPayments();

    renderDashboard();

    renderUpcomingPayments();

    renderCalendar();

    updateBudgetPeriodDisplay();

}


// ============================================================
// INCOME TABLE
// ============================================================

function renderIncome() {

    incomeTable.innerHTML = "";

    if (budget.income.length === 0) {

        incomeTable.innerHTML = `
            <tr>
                <td colspan="5">
                    No income added yet.
                </td>
            </tr>
        `;

        return;

    }

    const sorted =
        [...budget.income].sort(
            (a, b) =>
                new Date(a.nextDate) -
                new Date(b.nextDate)
        );

    sorted.forEach(item => {

        incomeTable.innerHTML += `

            <tr>

                <td>
                    ${escapeHtml(item.name)}
                </td>

                <td>
                    ${formatCurrency(item.amount)}
                </td>

                <td>
                    ${escapeHtml(item.frequency)}
                </td>

                <td>
                    ${formatDate(item.nextDate)}
                </td>

                <td class="actions">

                    <button
                        class="action-btn edit-btn"
                        onclick="editItem('income', '${item.id}')"
                        title="Edit">

                        <i class="fa-solid fa-pen"></i>

                    </button>

                    <button
                        class="action-btn delete-btn"
                        onclick="deleteItem('income', '${item.id}')"
                        title="Delete">

                        <i class="fa-solid fa-trash"></i>

                    </button>

                </td>

            </tr>

        `;

    });

}


// ============================================================
// PAYMENTS TABLE
// ============================================================

function renderPayments() {

    paymentTable.innerHTML = "";


    if (budget.payments.length === 0) {

        paymentTable.innerHTML = `
            <tr>
                <td colspan="6">
                    No recurring payments added yet.
                </td>
            </tr>
        `;

        return;

    }


    const sorted =
        [...budget.payments].sort(
            (a, b) =>
                new Date(a.nextDate) -
                new Date(b.nextDate)
        );


    sorted.forEach(item => {

        const days =
            getDaysUntil(item.nextDate);


        let statusClass = "";


        if (days < 0) {

            statusClass = "bad";

        } else if (days <= 7) {

            statusClass = "warning";

        } else {

            statusClass = "good";

        }


        paymentTable.innerHTML += `

            <tr>

                <td>
                    ${escapeHtml(item.name)}
                </td>

                <td>
                    ${formatCurrency(item.amount)}
                </td>

                <td>
                    ${escapeHtml(item.frequency)}
                </td>

                <td class="${statusClass}">
                    ${formatDate(item.nextDate)}
                </td>

                <td>

                    <button
                        class="action-btn paid-btn"
                        onclick="markPaid('${item.id}')">

                        ✓

                    </button>

                </td>

                <td>

                    <button
                        class="action-btn edit-btn"
                        onclick="editItem('payment', '${item.id}')">

                        <i class="fa-solid fa-pen"></i>

                    </button>

                    <button
                        class="action-btn delete-btn"
                        onclick="deleteItem('payment', '${item.id}')">

                        <i class="fa-solid fa-trash"></i>

                    </button>

                </td>

            </tr>

        `;

    });

}

// ============================================================
// ONE-OFF PAYMENTS TABLE
// ============================================================

function renderOneOffPayments() {

    if (!oneOffTable) {

        return;

    }


    oneOffTable.innerHTML = "";


    if (
        !Array.isArray(budget.oneOffPayments) ||
        budget.oneOffPayments.length === 0
    ) {

        oneOffTable.innerHTML = `
            <tr>
                <td colspan="4">
                    No one-off payments added yet.
                </td>
            </tr>
        `;

        return;

    }


    const sorted =
        [...budget.oneOffPayments].sort(
            (a, b) =>
                new Date(a.nextDate) -
                new Date(b.nextDate)
        );


    sorted.forEach(item => {

        oneOffTable.innerHTML += `

            <tr>

                <td>
                    ${escapeHtml(item.name)}
                </td>

                <td>
                    ${formatCurrency(item.amount)}
                </td>

                <td>
                    ${formatDate(item.nextDate)}
                </td>

                <td>

                    <button
                        class="action-btn edit-btn"
                        onclick="editItem('oneoff', '${item.id}')"
                        title="Edit">

                        <i class="fa-solid fa-pen"></i>

                    </button>

                    <button
                        class="action-btn delete-btn"
                        onclick="deleteItem('oneoff', '${item.id}')"
                        title="Delete">

                        <i class="fa-solid fa-trash"></i>

                    </button>

                </td>

            </tr>

        `;

    });

}

// ============================================================
// EDIT
// ============================================================

function editItem(type, id) {

    openModal(type, id);

}


// ============================================================
// DASHBOARD LABELS
// ============================================================

function updateDashboardLabels() {

    const schedule =
        budget.settings.schedule || "Fortnightly";


    if (incomePeriodLabel) {

        incomePeriodLabel.textContent =
            `${schedule} Income`;

    }


    if (paymentsPeriodLabel) {

        paymentsPeriodLabel.textContent =
            `${schedule} Expenses`;

    }

}

// ============================================================
// DASHBOARD
// ============================================================

function renderDashboard() {

	updateDashboardLabels();
	
    const income =
    getBudgetPeriodTotal(
        budget.income
    );

const payments =
    getBudgetPeriodTotal(
        budget.payments
    );


    const oneOffPayments =
    getCurrentPeriodOneOffTotal();

const remaining =
    income -
    payments -
    oneOffPayments;


    monthlyIncome.textContent =
        formatCurrency(income);


    monthlyPayments.textContent =
        formatCurrency(payments);


    remainingIncome.textContent =
        formatCurrency(remaining);


    if (budget.income.length === 0) {

        nextIncome.textContent =
            "No income added";

        return;

    }


    const sorted =
        [...budget.income].sort(
            (a, b) =>
                new Date(a.nextDate) -
                new Date(b.nextDate)
        );


    const next =
        sorted[0];


    nextIncome.innerHTML = `

        <strong>
            ${escapeHtml(next.name)}
        </strong>

        <br>

        <small>
            ${formatCurrency(next.amount)}
            ·
            ${formatDate(next.nextDate)}
        </small>

    `;

}

// ============================================================
// UPDATE CURRENT BUDGET PERIOD DISPLAY
// ============================================================

function updateBudgetPeriodDisplay() {

    if (!currentBudgetPeriod) {

        return;

    }


    const period =
        getCurrentBudgetPeriod();


    if (!period) {

        currentBudgetPeriod.textContent =
            "Set your next pay day";

        return;

    }


    currentBudgetPeriod.textContent =
        `${formatDate(period.start)} → ${formatDate(period.end)}`;

}

// ============================================================
// BUDGET PERIOD CALCULATIONS
// ============================================================

function getBudgetPeriodTotal(items) {

    const schedule =
        budget.settings.schedule || "Fortnightly";

    let total = 0;


    items.forEach(item => {

        switch (schedule) {

            // =================================================
            // WEEKLY
            // =================================================

            case "Weekly":

                switch (item.frequency) {

                    case "Weekly":

                        total +=
                            item.amount;

                        break;


                    case "Fortnightly":

                        total +=
                            item.amount / 2;

                        break;


                    case "Monthly":

                        total +=
                            item.amount * 12 / 52;

                        break;


                    case "Quarterly":

                        total +=
                            item.amount * 4 / 52;

                        break;


                    case "Yearly":

                        total +=
                            item.amount / 52;

                        break;

                }

                break;


            // =================================================
            // FORTNIGHTLY
            // =================================================

            case "Fortnightly":

                switch (item.frequency) {

                    case "Weekly":

                        total +=
                            item.amount * 2;

                        break;


                    case "Fortnightly":

                        total +=
                            item.amount;

                        break;


                    case "Monthly":

                        total +=
                            item.amount * 12 / 26;

                        break;


                    case "Quarterly":

                        total +=
                            item.amount * 4 / 26;

                        break;


                    case "Yearly":

                        total +=
                            item.amount / 26;

                        break;

                }

                break;


            // =================================================
            // MONTHLY
            // =================================================

            case "Monthly":

                switch (item.frequency) {

                    case "Weekly":

                        total +=
                            item.amount * 52 / 12;

                        break;


                    case "Fortnightly":

                        total +=
                            item.amount * 26 / 12;

                        break;


                    case "Monthly":

                        total +=
                            item.amount;

                        break;


                    case "Quarterly":

                        total +=
                            item.amount / 3;

                        break;


                    case "Yearly":

                        total +=
                            item.amount / 12;

                        break;

                }

                break;

        }

    });


    return total;

}

// ============================================================
// MONTHLY CALCULATIONS
// ============================================================

function getMonthlyTotal(items) {

    let total = 0;


    items.forEach(item => {

        switch (item.frequency) {

            case "Weekly":

                total +=
                    item.amount * 52 / 12;

                break;


            case "Fortnightly":

				total +=
					item.amount * 2;

				break;


            case "Monthly":

                total +=
                    item.amount;

                break;


            case "Quarterly":

                total +=
                    item.amount / 3;

                break;


            case "Yearly":

                total +=
                    item.amount / 12;

                break;

        }

    });


    return total;

}

// ============================================================
// FORTNIGHTLY CALCULATIONS
// ============================================================

function getFortnightlyTotal(items) {

    let total = 0;

    items.forEach(item => {

        switch (item.frequency) {

            case "Weekly":
                total += item.amount * 2;
                break;

            case "Fortnightly":
                total += item.amount;
                break;

            case "Monthly":
                total += item.amount * 12 / 26;
                break;

            case "Quarterly":
                total += item.amount * 4 / 26;
                break;

            case "Yearly":
                total += item.amount / 26;
                break;

        }

    });

    return total;
}

// ============================================================
// UPCOMING PAYMENTS
// ============================================================

function renderUpcomingPayments() {

    upcomingPayments.innerHTML = "";


    if (budget.payments.length === 0) {

        upcomingPayments.innerHTML =
            "<p>No upcoming payments.</p>";

        return;

    }


    const sorted =
        [...budget.payments].sort(
            (a, b) =>
                new Date(a.nextDate) -
                new Date(b.nextDate)
        );


    sorted.slice(0, 8).forEach(payment => {

        const days =
            getDaysUntil(payment.nextDate);


        let label;
        let className = "good";


        if (days < 0) {

            label = "Overdue";

            className = "bad";

        } else if (days === 0) {

            label = "Today";

            className = "warning";

        } else if (days === 1) {

            label = "Tomorrow";

            className = "warning";

        } else if (days <= 7) {

            label = `${days} days`;

            className = "warning";

        } else {

            label = `${days} days`;

        }


        upcomingPayments.innerHTML += `

            <div class="payment-item">

                <div>

                    <strong>
                        ${escapeHtml(payment.name)}
                    </strong>

                    <br>

                    <small>
                        ${formatCurrency(payment.amount)}
                    </small>

                </div>

                <span class="${className}">
                    ${label}
                </span>

            </div>

        `;

    });

}

// ============================================================
// CURRENT BUDGET PERIOD
// ============================================================

function getCurrentBudgetPeriod() {

    const schedule =
        budget.settings.schedule || "Fortnightly";

    const anchorDateString =
        budget.settings.anchorDate;


    // No anchor date set yet
    if (!anchorDateString) {

        return null;

    }


    const today =
        new Date();

    today.setHours(0, 0, 0, 0);


    let periodEnd =
        new Date(
            anchorDateString + "T00:00:00"
        );


    periodEnd.setHours(0, 0, 0, 0);


    // ========================================================
    // MOVE THE ANCHOR FORWARD UNTIL IT IS
    // THE NEXT PAY DAY
    // ========================================================

    while (periodEnd < today) {

        switch (schedule) {

            case "Weekly":

                periodEnd.setDate(
                    periodEnd.getDate() + 7
                );

                break;


            case "Fortnightly":

                periodEnd.setDate(
                    periodEnd.getDate() + 14
                );

                break;


            case "Monthly":

                periodEnd.setMonth(
                    periodEnd.getMonth() + 1
                );

                break;

        }

    }


    // ========================================================
    // CALCULATE PERIOD START
    // ========================================================

    const periodStart =
        new Date(periodEnd);


    switch (schedule) {

        case "Weekly":

            periodStart.setDate(
                periodStart.getDate() - 6
            );

            break;


        case "Fortnightly":

            periodStart.setDate(
                periodStart.getDate() - 13
            );

            break;


        case "Monthly":

            periodStart.setMonth(
                periodStart.getMonth() - 1
            );

            periodStart.setDate(
                periodStart.getDate() + 1
            );

            break;

    }


    return {

        start:
            formatDateForInput(periodStart),

        end:
            formatDateForInput(periodEnd)

    };

}

// ============================================================
// ONE-OFF PAYMENTS IN CURRENT BUDGET PERIOD
// ============================================================

function getCurrentPeriodOneOffTotal() {

    if (
        !Array.isArray(budget.oneOffPayments) ||
        budget.oneOffPayments.length === 0
    ) {

        return 0;

    }


    const period =
        getCurrentBudgetPeriod();


    // No anchor date has been configured yet
    if (!period) {

        return 0;

    }


    let total = 0;


    budget.oneOffPayments.forEach(item => {

        if (
            item.nextDate >= period.start &&
            item.nextDate <= period.end
        ) {

            total +=
                Number(item.amount) || 0;

        }

    });


    return total;

}
// ============================================================
// CALENDAR
// ============================================================

function renderCalendar() {

    const year =
        calendarDate.getFullYear();

    const month =
        calendarDate.getMonth();


    calendarMonth.textContent =
        new Date(
            year,
            month,
            1
        ).toLocaleDateString(
            "en-NZ",
            {
                month: "long",
                year: "numeric"
            }
        );


    calendarGrid.innerHTML = "";


    // Day headings
    const dayNames = [
        "Sun",
        "Mon",
        "Tue",
        "Wed",
        "Thu",
        "Fri",
        "Sat"
    ];


    dayNames.forEach(day => {

        calendarGrid.innerHTML += `
            <div class="calendar-day-name">
                ${day}
            </div>
        `;

    });


    const firstDay =
        new Date(
            year,
            month,
            1
        ).getDay();


    const daysInMonth =
        new Date(
            year,
            month + 1,
            0
        ).getDate();


    // Empty cells before month starts
    for (
        let i = 0;
        i < firstDay;
        i++
    ) {

        calendarGrid.innerHTML += `
            <div class="calendar-day empty"></div>
        `;

    }


    // Actual days
    for (
        let day = 1;
        day <= daysInMonth;
        day++
    ) {

        const date =
            new Date(
                year,
                month,
                day
            );


        const dateString =
            formatDateForInput(date);


        const events =
            getCalendarEvents(
                dateString
            );


        const today =
            getTodayString();


        const todayClass =
            dateString === today
                ? "today"
                : "";


        let eventHtml = "";


        events.forEach(event => {

            eventHtml += `

                <div class="calendar-event ${event.type}">

                    ${escapeHtml(event.name)}

                    <br>

                    <small>
                        ${formatCurrency(event.amount)}
                    </small>

                </div>

            `;

        });


        calendarGrid.innerHTML += `

            <div class="calendar-day ${todayClass}">

                <div class="calendar-number">
                    ${day}
                </div>

                ${eventHtml}

            </div>

        `;

    }

}


// ============================================================
// CALENDAR EVENTS
// ============================================================

function getCalendarEvents(dateString) {

    const events = [];

    const targetDate =
        new Date(dateString + "T00:00:00");


    // ----------------------------------------
    // INCOME
    // ----------------------------------------

    budget.income.forEach(item => {

        if (isRecurringOnDate(item, targetDate)) {

            events.push({

                type: "income-event",

                name: item.name,

                amount: item.amount

            });

        }

    });


    // ----------------------------------------
    // RECURRING PAYMENTS
    // ----------------------------------------

    budget.payments.forEach(item => {

        if (isRecurringOnDate(item, targetDate)) {

            events.push({

                type: "payment-event",

                name: item.name,

                amount: item.amount

            });

        }

    });


    // ----------------------------------------
    // ONE-OFF PAYMENTS
    // ----------------------------------------

    budget.oneOffPayments.forEach(item => {

        if (item.nextDate === dateString) {

            events.push({

                type: "oneoff-event",

                name: item.name,

                amount: item.amount

            });

        }

    });


    return events;

}

    // ----------------------------------------
    // ONE-OFF PAYMENTS
    // ----------------------------------------

    budget.oneOffPayments.forEach(item => {

        if (item.nextDate === dateString) {

            events.push({

                type: "oneoff-event",

                name: item.name,

                amount: item.amount

            });

        }

    });
	

// ============================================================
// CHECK RECURRING EVENT DATE
// ============================================================

function isRecurringOnDate(item, targetDate) {

    const startDate =
        new Date(item.nextDate + "T00:00:00");


    targetDate.setHours(0, 0, 0, 0);

    startDate.setHours(0, 0, 0, 0);


    // Don't show events before their starting date

    if (targetDate < startDate) {

        return false;

    }


    const diffDays =
        Math.round(
            (targetDate - startDate) /
            (1000 * 60 * 60 * 24)
        );


    switch (item.frequency) {


        case "Weekly":

            return diffDays % 7 === 0;


        case "Fortnightly":

            return diffDays % 14 === 0;


        case "Monthly":

            return (
                targetDate.getDate() ===
                startDate.getDate()
            );


        case "Quarterly":

            const monthDifference =
                (
                    targetDate.getFullYear() -
                    startDate.getFullYear()
                ) * 12 +
                (
                    targetDate.getMonth() -
                    startDate.getMonth()
                );


            return (
                monthDifference >= 0 &&
                monthDifference % 3 === 0 &&
                targetDate.getDate() ===
                startDate.getDate()
            );


        case "Yearly":

            return (
                targetDate.getMonth() ===
                startDate.getMonth() &&
                targetDate.getDate() ===
                startDate.getDate()
            );


        default:

            return false;

    }

}


// ============================================================
// DATE HELPERS
// ============================================================

function getTodayString() {

    return formatDateForInput(
        new Date()
    );

}


function formatDateForInput(date) {

    const year =
        date.getFullYear();

    const month =
        String(
            date.getMonth() + 1
        ).padStart(2, "0");

    const day =
        String(
            date.getDate()
        ).padStart(2, "0");


    return `${year}-${month}-${day}`;

}


function formatDate(dateString) {

    if (!dateString) {

        return "";

    }


    return new Date(
        dateString + "T00:00:00"
    ).toLocaleDateString(
        "en-NZ",
        {
            day: "numeric",
            month: "short",
            year: "numeric"
        }
    );

}


function getDaysUntil(dateString) {

    const today =
        new Date();

    today.setHours(
        0,
        0,
        0,
        0
    );


    const due =
        new Date(
            dateString + "T00:00:00"
        );


    due.setHours(
        0,
        0,
        0,
        0
    );


    return Math.round(
        (due - today) /
        (1000 * 60 * 60 * 24)
    );

}


// ============================================================
// MISC HELPERS
// ============================================================

function generateId() {

    if (
        window.crypto &&
        crypto.randomUUID
    ) {

        return crypto.randomUUID();

    }


    return (
        Date.now().toString(36) +
        Math.random()
            .toString(36)
            .substring(2)
    );

}


function escapeHtml(value) {

    return String(value)
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#039;");

}

function formatCurrency(value) {

    return new Intl.NumberFormat(
        "en-NZ",
        {
            style: "currency",
            currency: "NZD"
        }
    ).format(Number(value) || 0);

}

function updateCurrentDate() {

    if (!currentDate) {
        return;
    }

    const now = new Date();

    currentDate.textContent =
    "Today's Date • " +
    now.toLocaleDateString(
        "en-NZ",
        {
            weekday: "long",
            day: "numeric",
            month: "long",
            year: "numeric"
        }
    );
}

// ============================================================
// DEBUG
// ============================================================

window.budget = budget;

console.log(
    "Budget Dashboard loaded."
);

console.log(
    "Current budget period:",
    getCurrentBudgetPeriod()
);