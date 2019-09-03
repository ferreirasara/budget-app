var budgetController = (function() {
    // Object constructor for expenses
    var Expense = function(id, description, value) {
        this.id = id;
        this.description = description;
        this.value = value;
        this.percentage = -1;
    };

    Expense.prototype.calcPercentage = function(totalIncome) {
        if (totalIncome > 0) {
            this.percentage = Math.round((this.value / totalIncome) * 100);
        } else {
            this.percentage = -1;
        }
    };

    Expense.prototype.getPercentage = function() {
        return this.percentage;
    }

    // Object constructor for incomes
    var Income = function(id, description, value) {
        this.id = id;
        this.description = description;
        this.value = value;
    };
    // Object for all data that will be used
    var data = {
        allItens: {
            exp: [],
            inc: []
        },
        totals: {
            exp: 0,
            inc: 0
        }, 
        budget: 0,
        percentage: -1
    };
    var calculateTotal = function(type) {
        var sum = 0;
        data.allItens[type].forEach(function(cur) {
            sum += cur.value;
        });
        data.totals[type] = sum;
    };
    return {
        addItem: function(type, des, val) {
            var newItem, ID;
            // Create new ID
            if (data.allItens[type].length > 0) {
                ID = data.allItens[type][data.allItens[type].length - 1].id + 1;
            } else {
                ID = 0;
            }
            // Create new object based on 'inc' or 'exp'
            if (type === 'exp') {
                newItem = new Expense(ID, des, val);
            } else if (type === 'inc') {
                newItem = new Income(ID, des, val);
            }
            // Push it into our data struct
            data.allItens[type].push(newItem);
            // Return the new element
            return newItem;
        },
        deleteItem: function(type, id) {
            var ids, index;
            ids = data.allItens[type].map(function(current) {
                return current.id;
            });
            index = ids.indexOf(id);
            if (id !== -1) {
                data.allItens[type].splice(index, 1);
            }
        },
        calculateBudget: function() {
            // Calculate total income and expenses
            calculateTotal('exp');
            calculateTotal('inc');
            // Calculate the budget (income - expenses)
            data.budget = data.totals.inc - data.totals.exp;
            // Calculate the percentage of income thet we spends
            if (data.totals.inc > 0) {
                data.percentage = Math.round((data.totals.exp / data.totals.inc) * 100);
            } else {
                data.percentage = -1;
            }
        },
        calculatePercentages: function() {
            data.allItens.exp.forEach(function(cur) {
                cur.calcPercentage(data.totals.inc);
            });
        },
        getPercentages: function() {
            var allPerc = data.allItens.exp.map(function(cur) {
                return cur.getPercentage();
            });
            return allPerc;
        },
        getBudget: function() {
            return {
                budget: data.budget,
                totalInc: data.totals.inc,
                totalExp: data.totals.exp,
                percentage: data.percentage
            }
        }
    };
})();

var UIController = (function() {
    var DOMStrings = {
        inputType: '.add__type',
        inputDescription: '.add__description',
        inputValue: '.add__value',
        inputBtn: '.add__btn',
        incomeContainer: '.income__list',
        expensesContainer: '.expenses__list',
        budgetLabel: '.budget__value',
        incomeLabel: '.budget__income--value',
        expensesLabel: '.budget__expenses--value',
        percentageLabel: '.budget__expenses--percentage',
        container: '.container',
        expensesPercLabel: '.item__percentage',
        dateLabel: '.budget__title--month'
    }
    var formatNumber = function(num, type) {
        var numSplit, int, dec;
        num = Math.abs(num);
        num = num.toFixed(2);

        numSplit = num.split('.');
        int = numSplit[0];
        dec = numSplit[1];
        if (int.lenght > 3) {
            int = int.substr(0, int.lenght - 3) + ',' + int.substr(int.lenght - 3, int.lenght);
        }
        return (type === 'exp' ? '- ': '+ ') + int + '.' + dec;
    };
    var nodeListForEach = function(list, callback) {
        for (var i = 0; i < list.length; i++) {
            callback(list[i], i);
        }
    };
    return {
        getDOMStrings: function() { return DOMStrings; },
        getInput: function() {
            return {
                type: document.querySelector(DOMStrings.inputType).value, // Will be either inc or exp
                description: document.querySelector(DOMStrings.inputDescription).value,
                value: parseFloat(document.querySelector(DOMStrings.inputValue).value)
            };
        },
        addListItem: function(obj, type) {
            var html, newHtml, element;
            // Create the HTML string with placeholder text
            if (type === 'inc') {
                element = DOMStrings.incomeContainer;
                html = '<div class="item clearfix" id="inc-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>';
            } else if (type === 'exp') {
                element = DOMStrings.expensesContainer;
                html = '<div class="item clearfix" id="exp-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__percentage">21%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>';
            }
            // Replace the placeholder with some actual data
            newHtml = html.replace('%id%', obj.id);
            newHtml = newHtml.replace('%description%', obj.description);
            newHtml = newHtml.replace('%value%', formatNumber(obj.value, type));
            // Insert the HTML into the DOM
            document.querySelector(element).insertAdjacentHTML('beforeend', newHtml);
        },
        deleteListItem: function(selectorID) {
            var element = document.getElementById(selectorID);
            console.log(element);
            element.parentNode.removeChild(element);
        },
        clearFields: function() {
            var fields, fieldsArr;
            fields = document.querySelectorAll(DOMStrings.inputDescription + ', ' + DOMStrings.inputValue);
            fieldsArr = Array.prototype.slice.call(fields);
            fieldsArr.forEach(function(current, index, array) {
                current.value = "";
            });
            fieldsArr[0].focus();
        },
        dispayBudget: function(obj) {
            var type;
            obj.budget >= 0 ? type = 'inc' : type = 'exp';

            document.querySelector(DOMStrings.budgetLabel).textContent = formatNumber(obj.budget, type);
            document.querySelector(DOMStrings.incomeLabel).textContent = formatNumber(obj.totalInc, 'inc');
            document.querySelector(DOMStrings.expensesLabel).textContent = formatNumber(obj.totalExp, 'exp');
            if (obj.percentage > 0){
                document.querySelector(DOMStrings.percentageLabel).textContent = obj.percentage + '%';
            } else {
                document.querySelector(DOMStrings.percentageLabel).textContent = '---';
            }
        },
        displayMonth: function() {
            var now, year, month, months;
            now = new Date();
            year = now.getFullYear();
            month = now.getMonth();
            months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
            document.querySelector(DOMStrings.dateLabel).textContent = months[month] + ', ' + year;
        },
        displayPercentages: function(percentages) {
            var fields = document.querySelectorAll(DOMStrings.expensesPercLabel);
            nodeListForEach(fields, function(current, index) {
                if (percentages[index] > 0) {
                    current.textContent = percentages[index] + '%';
                } else {
                    current.textContent = '---';
                }
            });
        },
        changedType: function() {
            var fields = document.querySelectorAll(
                DOMStrings.inputType + ',' +
                DOMStrings.inputDescription + ',' +
                DOMStrings.inputValue
            );
            nodeListForEach(fields, function(cur) {
                cur.classList.toggle('red-focus');
            });
            document.querySelector(DOMStrings.inputBtn).classList.toggle('red');
        }
    };
})();

var controller = (function(budgetCtrl, UICtrl) {
    var setupEventListeners = function() {
        var DOM = UICtrl.getDOMStrings();
        document.querySelector(DOM.inputBtn).addEventListener('click', ctrlAddItem);
        document.addEventListener('keypress', function() {
            if (event.keyCode === 13 || event.which === 13) {
                ctrlAddItem();
            }
        });
        document.querySelector(DOM.container).addEventListener('click', ctrlDeleteItem);
        document.querySelector(DOM.inputType).addEventListener('change', UICtrl.changedType);
    };
    var updateBudget = function() {
        var budget;
        budgetCtrl.calculateBudget();
        budget = budgetCtrl.getBudget();
        UICtrl.dispayBudget(budget);
    };
    var updatePercentages = function() {
        budgetCtrl.calculatePercentages();
        var percentages = budgetCtrl.getPercentages();
        UICtrl.displayPercentages(percentages);
        console.log(percentages);

    };
    var ctrlAddItem = function() {
        var input, newItem;
        // Get the field input data from the UI
        input = UICtrl.getInput();
        if (input.description !== "" && !isNaN(input.value) && input.value > 0) {
            // Add the item to the budget controller
            newItem = budgetCtrl.addItem(input.type, input.description, input.value);
            // Add the item to the UI
            UICtrl.addListItem(newItem, input.type);
            // Clear the fields
            UICtrl.clearFields();
            // Calculate and update budget
            updateBudget();
            updatePercentages();
        }
    };
    var ctrlDeleteItem = function(event) {
        var itemID, splitID, type, ID;
        itemID = event.target.parentNode.parentNode.parentNode.parentNode.id;
        if (itemID) {
            splitID = itemID.split('-');
            type = splitID[0];
            ID =parseInt(splitID[1]);
            budgetCtrl.deleteItem(type, ID);
            UICtrl.deleteListItem(itemID);
            updateBudget();
            updatePercentages();
        }
    };
    return {
        init: function() {
            console.log('Aplication has started.');
            UICtrl.displayMonth();
            UICtrl.dispayBudget({
                budget: 0,
                totalInc: 0,
                totalExp: 0,
                percentage: -1
            });
            setupEventListeners();
        }
    }
})(budgetController, UIController);
controller.init();