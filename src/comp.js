import React from 'react';
import _ from 'lodash';

//recursive function to generate possible combination if exist to indicate if game over or still more moves
var possibleCombinationSum = function(arr, n) {
    if (arr.indexOf(n) >= 0) { return true; }
    if (arr[0] > n) { return false; }
    if (arr[arr.length - 1] > n) {
        arr.pop();
        return possibleCombinationSum(arr, n);
    }
    var listSize = arr.length, combinationsCount = (1 << listSize)
    for (var i = 1; i < combinationsCount ; i++ ) {
        var combinationSum = 0;
        for (var j=0 ; j < listSize ; j++) {
            if (i & (1 << j)) { combinationSum += arr[j]; }
        }
        if (n === combinationSum) { return true; }
    }
    return false;
};

const Stars= (props)=> {
    // const numberOfStars= 1 + Math.floor(Math.random()*9);
    // let stars=[];
    // for(let i=0 ; i<numberOfStars; i++){
    // 	stars.push(<i key={i} className="fa fa-star"></i>);
    // }
    return(
        <div className="col-4">
            {_.range(props.numberOfStars).map(i =>
                <i key={i} className="fa fa-star"></i>
            )}
        </div>
    );
}

const Button= (props)=> {
    let button;
    switch(props.answerIsCorrect){
        case true:
            button=
                <button className="btn btn-success" onClick={props.acceptAnswer}> <i className="fa fa-check"></i></button>
            break;

        case false:
            button=
                <button className="btn btn-danger"> <i className="fa fa-times"></i></button>
            break;

        default:
            button =
                <button className="btn"
                        onClick={props.checkAnswer}
                        disabled={props.selectedNumbers.length === 0} > =</button>
            break;
    }

    return(
        <div className="col-2 text-center">
            {button}
            <br/><br/>
            <button className="btn btn-warning btn-sm" onClick={props.redraw} disable={props.redraws === 0}>
                <i className="fa fa-refresh"></i> {props.redraws}
            </button>
        </div>
    );
};

const Numbers= (props)=> {
    const numberClassName = (number) => {
        if(props.usedNumbers.indexOf(number)>=0){
            return 'used';
        }
        if(props.selectedNumbers.indexOf(number)>=0){
            return 'selected';
        }
    }
    return(
        <div className="card text-center">
            <div>
                {Numbers.list.map((number,i)=>
                        <span key={i} className={numberClassName(number)}
                              onClick={()=> props.selectNumber(number)}>
                {number}
          </span>
                )}
            </div>
        </div>
    );
}

Numbers.list = _.range(1,10);

const Answer = (props)=> {
    return(
        <div className="col-5">
            {props.selectedNumbers.map((number,i) =>
                <span key={i} onClick={()=> props.unSelectNumber(number)}>{number}</span>
            )}
        </div>
    );
}

const DoneFrame= (props)=> {
    return(
        <div className="text-center">
            <h2>{props.doneStatus}</h2>
            <button className="btn btn-secondary" onClick={props.resetGame}>Play again</button>
        </div>
    );
}


export default class Game extends React.Component{
    static randomNumber = () => 1 + Math.floor(Math.random()*9);
    static initialState= () => ({
        selectedNumbers:[],
        randomNumberOfStars: Game.randomNumber(),
        usedNumbers: [],
        answerIsCorrect:null,
        redraws: 10,
        doneStatus: null,
    });

    state =Game.initialState();
    resetGame = () => this.setState(Game.initialState());

    selectNumber = (clickedNumber) => {
        if(this.state.selectedNumbers.indexOf(clickedNumber) >=0 ){return;}
        this.setState(prevState => ({
            answerIsCorrect: null,
            selectedNumbers: prevState.selectedNumbers.concat(clickedNumber),
        }));
    };

    unSelectNumber = (clickedNumber) => {
        this.setState(prevState => ({
            answerIsCorrect: null,
            selectedNumbers: prevState.selectedNumbers.filter(number=> number !== clickedNumber)
        }));
    }

    checkAnswer = () => {
        this.setState(prevState=> ({
            answerIsCorrect: prevState.randomNumberOfStars === prevState.selectedNumbers.reduce((acc,n)=> acc + n,0)
        }));
    }

    acceptAnswer = () => {
        this.setState(prevState => ({
            usedNumbers: prevState.usedNumbers.concat(prevState.selectedNumbers),
            selectedNumbers: [],
            answerIsCorrect:null,
            randomNumberOfStars: Game.randomNumber(),
        }), this.updateDoneStatus);
    };
    redraw = () => {
        if(this.state.redraws === 0 ){return;}
        this.setState(prevState=> ({
            randomNumberOfStars: Game.randomNumber(),
            answerIsCorrect:null,
            selectedNumbers:[],
            redraws: prevState.redraws - 1,
        }),this.updateDoneStatus);
    }

    possibleSolution = ({randomNumberOfStars , usedNumbers}) => {
        const possibleNumbers = _.range(1, 10).filter(number =>
            usedNumbers.indexOf(number) === -1
        );
        return possibleCombinationSum(possibleNumbers,randomNumberOfStars);
    };

    updateDoneStatus= () => {
        this.setState(prevState => {
            if (prevState.usedNumbers.length === 9){
                return {doneStatus: 'Done. Nice!'}
            }
            if(prevState.redraws === 0 && !this.possibleSolution(prevState)){
                return {doneStatus: 'Game Over!'}
            }
        });

    }

    render(){
        const {selectedNumbers , randomNumberOfStars, answerIsCorrect, usedNumbers, redraws, doneStatus } = this.state
        return(
            <div>
                <h3>Play nine</h3>
                <div className="row">

                    <Stars numberOfStars={randomNumberOfStars}/>

                    <Button selectedNumbers={selectedNumbers}
                            redraws={redraws}
                            checkAnswer={this.checkAnswer}
                            acceptAnswer={this.acceptAnswer}
                            answerIsCorrect={answerIsCorrect}
                            redraw={this.redraw}

                    />

                    <Answer selectedNumbers={selectedNumbers}
                            unSelectNumber={this.unSelectNumber}
                    />
                </div>
                <br /><br/>
                {doneStatus ?
                    <DoneFrame	resetGame={this.resetGame} doneStatus={doneStatus} />
                    :
                    <Numbers selectedNumbers={selectedNumbers}
                             selectNumber={this.selectNumber}
                             usedNumbers={usedNumbers}
                    /> }



            </div>
        );
    }
}
