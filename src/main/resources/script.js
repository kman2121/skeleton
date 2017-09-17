const apiUrl = '';
axios.defaults.headers.post['Content-Type'] = 'application/json';
axios.defaults.headers.put['Content-Type'] = 'application/json';

const AddTagButton = React.createClass({
    getInitialState: function() {
        return {
            showInput: false,
            tagName: ''
        };
    },
    handleClick: function(e) {
        this.setState({showInput: true});
    },
    updateTagName: function(e) {
        this.setState({tagName: e.target.value})
    },
    handleKeyDown: function(e) {
        if (e.key === 'Enter') {
            if (!this.state.tagName) {
                this.setState({showInput: false});
                return;
            }
            this.props.toggleTag(this.state.tagName).then(() => {
                this.props.refreshList();
                this.setState({
                    showInput: false,
                    tagName: ''
                });
            });
        }
    },
    render: function() {
        return (
            <div>
                {this.state.showInput ?
                <input className="tag_input tag-btn" type="text" placeholder="Tag Name" required
                       value={this.state.tagName}
                       style={{
                           borderColor: this.state.tagName ? 'initial': 'red',
                           cursor: 'text'
                       }}
                       onChange={this.updateTagName} onKeyDown={this.handleKeyDown} /> :
                <div className="add-tag tag-btn"
                     style={{display: this.state.showInput ? 'none': 'block'}}
                     onClick={this.handleClick}>Add +</div>}
            </div>
        )
    }
});

const TagElement = React.createClass({
    handleClick: function(e) {
        this.props.toggleTag(this.props.label).then(() => this.props.refreshList());
    },
    render: function() {
        return (
            <div className="tagValue tag-btn" onClick={this.handleClick}>
                {this.props.label} <span style={{float: 'right'}}>x</span>
            </div>
        )
    }
});

const Receipt = React.createClass({
    toggleTag: function(tagName) {
        return axios.put(`${apiUrl}/tags/${tagName}`,
                   this.props.id
               )
    },
    render: function() {
        const tags = this.props.tags.map((tag, i) => {
            return <TagElement key={i} label={tag}
                               toggleTag={this.toggleTag} refreshList={this.props.refreshList} />
        });

        return (
            <div className="row receipt">
                <div className="el">{this.props.time}</div>
                <div className="el merchant">{this.props.merchant}</div>
                <div className="el amount">{this.props.amount}</div>
                <div className="el tags">
                    <AddTagButton toggleTag={this.toggleTag} refreshList={this.props.refreshList} />
                    {tags}
                </div>
            </div>
        )
    }
});

const ReceiptList = React.createClass({
    render: function() {
        const receiptRows = this.props.receipts.map((receipt) => {
            return (<Receipt
                key={receipt.id}
                id={receipt.id}
                time={receipt.created}
                merchant={receipt.merchant}
                amount={receipt.amount}
                tags={receipt.tags}
                refreshList={this.props.refreshList} />)
        });

        return (
            <div style={{clear: 'both'}}>
                <div className="row receiptList-header">
                    <div className="el">Time</div>
                    <div className="el">Merchant</div>
                    <div className="el">$</div>
                    <div className="el">Tags</div>
                </div>
                <div id="receiptList">
                    {receiptRows}
                </div>
            </div>
        )
    }
});

const AddReceiptForm = React.createClass({
    getInitialState: function() {
        return {
            merchant: '',
            amount: ''
        }
    },
    updateMerchant: function(e) {
        this.setState({merchant: e.target.value});
    },
    updateAmount: function(e) {
        if (Number(e.target.value) == e.target.value) {
            this.setState({amount: e.target.value});
        }
    },
    handleCancelClick: function(e) {
        this.setState({
            merchant: '',
            amount: ''
        });
        this.props.closeForm();
    },
    handleSaveClick: function(e) {
        if (!this.state.merchant) { return; }
        axios.post(`${apiUrl}/receipts`, {
            merchant: this.state.merchant,
            amount: this.state.amount
        }).then(() => {
            this.props.refreshList();
            this.handleCancelClick(e);
        });
    },
    render: function() {
        return (
            <div id="add-receipt-form" style={{display: this.props.toShow ? 'flex' : 'none'}}>
                <input id="merchant" type="text" placeholder="Merchant" value={this.state.merchant}
                       style={{borderColor: this.state.merchant ? 'initial': 'red'}}
                       onChange={this.updateMerchant}/>
                <input id="amount" type="text" placeholder="Amount" value={this.state.amount}
                       onChange={this.updateAmount}/>
                <div id="button-row">
                    <div id="cancel-receipt" className="receipt-btn"
                         onClick={this.handleCancelClick}>Cancel</div>
                    <div id="save-receipt" className="receipt-btn"
                         style={{
                             cursor: this.state.merchant ? 'pointer' : 'not-allowed',
                             borderColor: this.state.merchant ? '#229' : 'red'
                         }}
                         onClick={this.handleSaveClick}>Save</div>
                </div>
            </div>
        )
    }
});

const Header = React.createClass({
    render: function() {
        return (
            <div id="header">
                <h1>My Receipts</h1>
                <div id="add-receipt" onClick={this.props.toggleForm}>{this.props.receiptFormOpen ? '-' : '+'}</div>
            </div>
        )
    }
});

const ReceiptApp = React.createClass({
    getInitialState: function () {
        return {
            receipts: [],
            showForm: false
        };
    },
    componentDidMount: function() {
        this.refreshReceipts();
    },
    refreshReceipts: function() {
        axios.get(`${apiUrl}/receipts`).then((res) => {
                  this.setState({receipts: res.data});
              });
    },
    toggleForm: function() {
        this.setState({showForm: !this.state.showForm});
    },
    render: function() {
        return (
            <div style={{width: '100%'}}>
                <Header receiptFormOpen={this.state.showForm} toggleForm={this.toggleForm}/>
                <AddReceiptForm toShow={this.state.showForm} closeForm={this.toggleForm} refreshList={this.refreshReceipts} />
                <ReceiptList receipts={this.state.receipts} refreshList={this.refreshReceipts} />
            </div>
        )
    }
});

ReactDOM.render(
    <ReceiptApp />,
    document.getElementById('container')
);
