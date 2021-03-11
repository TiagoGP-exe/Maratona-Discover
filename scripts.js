const Modal = {
    open (){
        //abrir modal
        //adicionar o class active ao modal
        document.querySelector('.modal-overlay')
        .classList.add('active')
    },
    close(){
        //fechar modal
        //remover a class active do modal
        document.querySelector('.modal-overlay')
        .classList.remove('active')
    }
}

const Storage = {
    get(){
        return JSON.parse(localStorage.getItem('dev.finances:transactions')) || []
    },

    set(transactions){
        localStorage.setItem("dev.finances:transactions", JSON.stringify(transactions))
    }
}

//Eu preciso somar as entradas
//depois eu preciso somar as saídas e remover 
//das entradas o valor da saídas
//assim, eu terei o total

const Transaction = {
    all: Storage.get(),  
    add(transaction){
        Transaction.all.push(transaction)
        console.log(Transaction.all)
        App.reload()
    },

    remove(index){
        Transaction.all.splice(index, 1)

        App.reload()
    },

    incomes() {
        let income = 0;
        //pegar todas as tansações 
        //para cada transação 
        Transaction.all.forEach(Transaction => {
            //se for mairo que zero
            if(Transaction.amount > 0){
                income += Transaction.amount;
            }
            //somar a uma variavel e retornar a variavel
        })
        return income;
    },
    expenses() {
        let expense = 0;
        //pegar todas as tansações 
        //para cada transação 
        Transaction.all.forEach(Transaction => {
            //se for mairo que zero
            if(Transaction.amount < 0){
                expense += Transaction.amount;
            }
            //somar a uma variavel e retornar a variavel
        })
        return expense;
    },
    total() {
        return Transaction.incomes() + Transaction.expenses();
    }
}

//Sbustituir os dados do HTML com os dados do JS

const Utils ={
    formatAmount(value){
        value = value * 100
        
        return Math.round(value)
    },

    formatDate(date){
        const splitteDate = date.split("-")
        return `${splitteDate[2]}/${splitteDate[1]}/${splitteDate[0]}`
    },

    formatCurrency(value){
        const signal = Number(value) < 0 ? "-" : ""

        value =  String(value).replace(/\,?\.?/g,"")

        value = Number(value) / 100

        value = value.toLocaleString("pt-BR", {
            style: "currency",
            currency: "BRL"
        })

        return (signal + value)
    }
}

const Form = {
    description: document.querySelector('input#description'),
    amount: document.querySelector('input#amount'),
    date: document.querySelector('input#date'),

    getValues() {
        return{
            description: Form.description.value,
            amount:Form.amount.value,
            date: Form.date.value
        }
    },

    validateFields() {
        const { description, amount, date } = Form.getValues()
        
        if( description.trim() === "" || 
            amount.trim() === "" || 
            date.trim() === "" ) {
                throw new Error("Por favor, preencha todos os campos")
        }
    },

    formatValues(){
        let {description, amount, date}  = Form.getValues()

        amount = Utils.formatAmount(amount)

        date = Utils.formatDate(date)
        console.log(`description: ${description}, date: ${date}, amount: ${amount}`)

        return {
            description,
            amount,
            date
        }
    },
    
    clearFileds(){
        Form.description.value = ""
        Form.amount.value = ""
        Form.date.value = ""
    },

    submit(event) {  
        event.preventDefault()//Exclui o valores padrões

        try {
            //verificar se todas as informações foram preenchidas
            Form.validateFields()
            //formatar os dados para salvar
            const transaction = Form.formatValues()
            //salvar
            Transaction.add(transaction)
            //apagar os dados do formulário
            Form.clearFileds()
            //modal feche
            Modal.close()      
        } catch(error){
            alert(error.message)
        }
    }
}

const DOM = {
    TransactionsContainer: document.querySelector('#data-table tbody'),

    addTransaction(Transaction, index){
        const tr = document.createElement('tr')
        tr.innerHTML = DOM.innerHTMLTrasnsaction(Transaction, index)
        tr.dataset.index = index
        DOM.TransactionsContainer.appendChild(tr)
    },
    innerHTMLTrasnsaction(Transaction, index){
        const CSSclass = Transaction.amount > 0 ? "income" : "expense"

        const amount = Utils.formatCurrency(Transaction.amount)

        const html = 
       `<td class="descriction">${Transaction.description}</td>
        <td class="${CSSclass}">${amount}</td>
        <td class="date">${Transaction.date}</td>
        <td>
            <img onclick="Transaction.remove(${index})" src="./assets/minus.svg" alt="Remover transação">
        </td>`

        return html
    },
    upadateBalance(){
        document.getElementById('incomeDisplay')
        .innerHTML = Utils.formatCurrency(Transaction.incomes())
        document.getElementById('expenseDisplay')
        .innerHTML = Utils.formatCurrency(Transaction.expenses())
        document.getElementById('totalDisplay')
        .innerHTML = Utils.formatCurrency(Transaction.total())
    },
    clearTransaction(){
        DOM.TransactionsContainer.innerHTML = ""
    }
}

const App = {
    init(){

        Transaction.all.forEach(DOM.addTransaction)
        
        DOM.upadateBalance()
        
        Storage.set(Transaction.all)
    },
    reload(){
        DOM.clearTransaction()
        App.init()
    },
}

App.init()
