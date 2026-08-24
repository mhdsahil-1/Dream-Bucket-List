let input = document.getElementById("goalInput");
let addBtn = document.getElementById("addBtn");
let goalList = document.getElementById("goalList");

let goals = JSON.parse(localStorage.getItem("goals")) || [];

showGoals();

addBtn.addEventListener("click", addGoal);

function addGoal() {
    let text = input.value.trim();
    if(text === ""){
        alert("Enter a goal");
        return;
    }

    goals.push({
        name: text,
        done: false
    });

    saveData();
    input.value = "";
    showGoals();
}

function showGoals() {
    goalList.innerHTML = "";
    let completed = 0;
    for(let i = 0; i < goals.length; i++) {
        if(goals[i].done){
            completed++;
        }
        goalList.innerHTML += `
        <li class="goal-item">

            <span class="${goals[i].done ? "completed" : ""}">
                ${goals[i].name}
            </span>

            <div class="actions">

                <button class="complete-btn"
                onclick="toggleGoal(${i})">
                add
                </button>

                <button class="delete-btn"
                onclick="deleteGoal(${i})">
                remove
                </button>

            </div>

        </li>   
        `;
    }

    let total = goals.length;
    let pending = total - completed;

    document.getElementById("totalGoals").innerText = total;
    document.getElementById("completedGoals").innerText = completed;
    document.getElementById("pendingGoals").innerText = pending;

    let percent = 0;

    if(total > 0){
        percent = (completed / total) * 100;
    }

    document.getElementById("progressFill").style.width =
    percent + "%";
    document.getElementById("progressPercent").innerText =
    Math.round(percent) + "%";
}

function toggleGoal(index){

    goals[index].done = !goals[index].done;
    saveData();
    showGoals();
}

function deleteGoal(index){
    goals.splice(index,1);
    saveData();
    showGoals();
}

function saveData(){
    localStorage.setItem(
        "goals",
        JSON.stringify(goals)
    );
}