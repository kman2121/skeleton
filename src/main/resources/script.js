const apiUrl = document.location.hostname === 'localhost' ? 'http://localhost:8080' : '';
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
            merchant: this.props.initMerchant,
            amount: this.props.initAmount
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
            <div id="add-receipt-form">
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

const CameraModal = React.createClass({
    getInitialState: function() {
        return {
            track: null,
            imageCapture: null,
            errorMessage: ''
        };
    },
    componentDidMount: function() {
        navigator.mediaDevices.getUserMedia({video: {facingMode: { ideal: 'environment'}}})
            .then(mediaStream => {
                document.getElementsByTagName('video')[0].srcObject = mediaStream;

                // Saving the track allows us to capture a photo
                let track = mediaStream.getVideoTracks()[0];
                this.setState({
                    track: track,
                    imageCapture: new ImageCapture(track)
                });
            }).catch(error => console.log);
    },
    componentWillUnmount: function() {
        this.state.track.stop();
    },
    takeSnapshot: function() {
        this.state.imageCapture.takePhoto()
            .then(blob => createImageBitmap(blob))
            .then(img => {
                const canvas = document.createElement('canvas');
                canvas.width = img.width;
                canvas.height = img.height;

                canvas.getContext('2d').drawImage(img, 0, 0);
                axios({
                    method: 'POST',
                    url: `${apiUrl}/images`,
                    data: canvas.toDataURL().split('data:image/png;base64,')[1],
                    headers: {
                        'Content-Type': 'text/plain'
                    }
                }).then(res => {
                    if (res.data.merchantName && res.data.amount) {
                        this.props.openReceiptForm(res.data.merchantName, res.data.amount);
                        this.props.toggleCameraModal();
                    } else {
                        this.setState({
                            errorMessage: 'Could not parse receipts, please try again'
                        });
                    }
                }).catch(err => this.setState({errorMessage: err}));
            });
    },
    render: function() {
        return (
            <div id="camera-modal">
                <div id="modal-header">
                    <span>Camera</span>
                    <span id="take-pic-cancel" onClick={this.props.toggleCameraModal}>x</span>
                </div>

                <div id="video-wrapper">
                    <video autoPlay></video>
                </div>

                <div id="take-pic" onClick={this.takeSnapshot}>Snap Receipt</div>

                <div id="error-message">{this.state.errorMessage}</div>
            </div>
        )
    }
})

const Header = React.createClass({
    render: function() {
        return (
            <div id="header">
                <h1>My Receipts</h1>
                <div id="add-receipt" className="button" onClick={this.props.toggleForm}>{this.props.receiptFormOpen ? '-' : '+'}</div>
                <div id="start-camera" className="button" onClick={this.props.toggleCameraModal}>
                    <img src="data:image/svg+xml;utf8;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0iaXNvLTg4NTktMSI/Pgo8IS0tIEdlbmVyYXRvcjogQWRvYmUgSWxsdXN0cmF0b3IgMTkuMS4wLCBTVkcgRXhwb3J0IFBsdWctSW4gLiBTVkcgVmVyc2lvbjogNi4wMCBCdWlsZCAwKSAgLS0+CjxzdmcgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIiB4bWxuczp4bGluaz0iaHR0cDovL3d3dy53My5vcmcvMTk5OS94bGluayIgdmVyc2lvbj0iMS4xIiBpZD0iQ2FwYV8xIiB4PSIwcHgiIHk9IjBweCIgdmlld0JveD0iMCAwIDMzMy42NjggMzMzLjY2OCIgc3R5bGU9ImVuYWJsZS1iYWNrZ3JvdW5kOm5ldyAwIDAgMzMzLjY2OCAzMzMuNjY4OyIgeG1sOnNwYWNlPSJwcmVzZXJ2ZSIgd2lkdGg9IjUxMnB4IiBoZWlnaHQ9IjUxMnB4Ij4KPGc+Cgk8cGF0aCBkPSJNMjk1LjEwMSwyOTguNjQ5SDM4LjU2MUMxNy4yOTUsMjk4LjY0OSwwLDI4MS4zNTQsMCwyNjAuMDg4VjEwMy43MDNjMC0yMS4yNjYsMTcuMjk1LTM4LjU2MSwzOC41NjEtMzguNTYxaDUyLjM0NyAgIGw0LjU4Mi0xNS40NTdjMS44Ny04LjQ1OCw5LjYwMi0xNC42NjYsMTguNjk2LTE0LjY2NmgxMDUuMjk3YzguODM3LDAsMTYuNjU4LDYuMTc2LDE4LjcyOCwxNC43NDNsMC4xMjIsMC41MjdsNC4xNzcsMTQuODUyaDUyLjU5NyAgIGMyMS4yNjYsMCwzOC41NjEsMTcuMjk1LDM4LjU2MSwzOC41NjF2MTU2LjM4NEMzMzMuNjYyLDI4MS4zNTQsMzE2LjM2MSwyOTguNjQ5LDI5NS4xMDEsMjk4LjY0OXogTTM4LjU2MSw3Ny45OTYgICBjLTE0LjE3OCwwLTI1LjcwNywxMS41My0yNS43MDcsMjUuNzA3djE1Ni4zODRjMCwxNC4xNzgsMTEuNTMsMjUuNzA3LDI1LjcwNywyNS43MDdoMjU2LjU0YzE0LjE3OCwwLDI1LjcwNy0xMS41MywyNS43MDctMjUuNzA3ICAgVjEwMy43MDNjMC0xNC4xNzgtMTEuNTMtMjUuNzA3LTI1LjcwNy0yNS43MDdoLTYyLjMyN2wtNy4wMzctMjUuMDk3Yy0wLjY0OS0yLjkxOC0zLjI3OC01LjAzMi02LjI2LTUuMDMySDExNC4xNzkgICBjLTMuMDI3LDAtNS41OTgsMi4wNjktNi4yNiw1LjAzOWwtNy40MjksMjUuMDlIMzguNTYxeiBNMTY2Ljg0MSwyNTkuNzk4Yy00NC45ODEsMC04MS41NzYtMzYuNTg4LTgxLjU3Ni04MS41NjMgICBjMC00NC45ODEsMzYuNTk0LTgxLjU2OSw4MS41NzYtODEuNTY5YzQ0Ljk2OSwwLDgxLjU1NywzNi41OTQsODEuNTU3LDgxLjU2OUMyNDguMzk3LDIyMy4yMDQsMjExLjgwOSwyNTkuNzk4LDE2Ni44NDEsMjU5Ljc5OHogICAgTTE2Ni44NDEsMTA5LjUxM2MtMzcuODkzLDAtNjguNzIyLDMwLjgyMy02OC43MjIsNjguNzE2czMwLjgzLDY4LjcwOSw2OC43MjIsNjguNzA5YzM3Ljg4NiwwLDY4LjcwMy0zMC44MjMsNjguNzAzLTY4LjcwOSAgIEMyMzUuNTQzLDE0MC4zMzYsMjA0LjcyLDEwOS41MTMsMTY2Ljg0MSwxMDkuNTEzeiBNMjg2LjgwNCwxMDEuODUyYy02LjU1NSwwLTExLjg1OCw1LjMxNS0xMS44NTgsMTEuODU4ICAgYzAsNi41NDksNS4zMDIsMTEuODU3LDExLjg1OCwxMS44NTdjNi41NDksMCwxMS44NTEtNS4zMDksMTEuODUxLTExLjg1N0MyOTguNjQ5LDEwNy4xNjcsMjkzLjM0NiwxMDEuODUyLDI4Ni44MDQsMTAxLjg1MnoiIGZpbGw9IiNGRkZGRkYiLz4KPC9nPgo8Zz4KPC9nPgo8Zz4KPC9nPgo8Zz4KPC9nPgo8Zz4KPC9nPgo8Zz4KPC9nPgo8Zz4KPC9nPgo8Zz4KPC9nPgo8Zz4KPC9nPgo8Zz4KPC9nPgo8Zz4KPC9nPgo8Zz4KPC9nPgo8Zz4KPC9nPgo8Zz4KPC9nPgo8Zz4KPC9nPgo8Zz4KPC9nPgo8L3N2Zz4K" />
                </div>
            </div>
        )
    }
});

const ReceiptApp = React.createClass({
    getInitialState: function () {
        return {
            receipts: [],
            initMerchant: '',
            initAmount: '',
            showForm: false,
            showCameraModal: false
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
    toggleForm: function(e = null) {
        if (!this.state.showCameraModal && e) {
            this.setState({ showForm: !this.state.showForm });
        }
    },
    toggleCameraModal: function() {
        this.setState({
            showCameraModal: !this.state.showCameraModal,
            showForm: this.state.showCameraModal ? this.state.showForm : false
        });
    },
    updateFormInputs: function(merchantName, amount) {
        this.setState({
            showForm: true,
            initMerchant: merchantName,
            initAmount: amount
        });
    },
    render: function() {
        return (
            <div>
                <div style={{
                    width: '100%',
                    opacity: this.state.showCameraModal ? '0.2' : '1',
                    border: '1px solid brown',
                    padding: '25px',
                    boxSizing: 'border-box'
                    }}>
                    <Header receiptFormOpen={this.state.showForm} toggleForm={this.toggleForm} toggleCameraModal={this.toggleCameraModal} />
                    {this.state.showForm ? <AddReceiptForm closeForm={this.toggleForm} refreshList={this.refreshReceipts} initAmount={this.state.initAmount} initMerchant={this.state.initMerchant} /> : ''}
                    <ReceiptList receipts={this.state.receipts} refreshList={this.refreshReceipts} />
                </div>
                {this.state.showCameraModal ? <CameraModal toggleCameraModal={this.toggleCameraModal} openReceiptForm={this.updateFormInputs} /> : ''}
            </div>
        )
    }
});

ReactDOM.render(
    <ReceiptApp />,
    document.getElementById('container')
);
