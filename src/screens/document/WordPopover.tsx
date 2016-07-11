import * as React from "react";
import TextField from "material-ui/TextField";
import FlatButton from "material-ui/FlatButton";
import { grey500 } from "material-ui/styles/colors";
import { observable } from "mobx";
import { observer } from "mobx-react";

import { translit, getColour } from "../../utils";
import { Word as WordType, DocumentStore, Token } from "../../stores/documents";

interface WordPopoverProps {
    word: WordType;
    onSaveWordAnalysis: any;
    onTouchTapCancel: any;
}

@observer
export class WordPopover extends React.Component<WordPopoverProps, {}> {
    @observable localWord: string;

    constructor(props) {

        super(props);
        this.localWord = this.props.word.analysis ? this.props.word.analysis.map(token => token.token).join(" ") : this.props.word.word;
    }

    handleWordChange = (event) => {

        this.localWord = event.target.value.trim();
    }

    handleTokenMeaningEntered = (event) => {

        console.log(event.currentTarget.value);
    }

    handleSave = (event) => {

        const { word } = this.props;

        const analysis = this.localWord.split(/\s+/).map((token, tokenIndex): Token => {

            return {
                id: word.id + "." + (tokenIndex + 1),
                token: token
            };
        });

        this.props.onSaveWordAnalysis(event, { id: word.id, word, analysis });
    }

    render() {

        if (!this.props.word) {
            return null;
        }

        return (
            <div style={ styles.popoverStyle }>
                <div style={ styles.heading }>{ translit(this.props.word.word) }</div>
                <TextField
                    floatingLabelText={ `Sandhi vichchheda for ${translit(this.props.word.word)}` }
                    defaultValue={ this.localWord }
                    onChange={ this.handleWordChange }
                    fullWidth
                    />
                <div>
                    {
                        this.localWord.split(/\s+/).map((w, i) => {
                            // return React.Children.toArray([
                            //     <span style={ { color: grey500 } }> { i === 0 ? "=" : "+"} </span>,
                            //     <span style={ Object.assign({ color: getColour(i) }, styles.sandhi) }>{ translit(w) }</span>
                            // ]);
                            return (
                                <div style={ styles.tokenContainer } key={ i }>
                                    <span style={ { color: grey500, marginRight: 5 } }> { i === 0 ? "=" : "+"} </span>
                                    <span style={ Object.assign({ color: getColour(i) }, styles.sandhi) }>{ translit(w) }</span>
                                    <span style={ { color: grey500, marginRight: 5 } }> = </span>
                                    <TextField onChange={ this.handleTokenMeaningEntered } hintText={ `Meaning of ${translit(w)}` } fullWidth />
                                </div>
                            );
                        })
                    }
                </div>
                <div className="row" style={ styles.createButton }>
                    <div className="col-xs-12">
                        <FlatButton label="Cancel" secondary onTouchTap={ this.props.onTouchTapCancel } />
                        <FlatButton label="Save" primary onTouchTap={ this.handleSave } />
                    </div>
                </div>
            </div>
        );
    }
}

const styles = {
    popoverStyle: {
        padding: "10px 20px",
        minWidth: 400
    },
    createButton: {
        textAlign: "right"
    },
    heading: {
        fontWeight: "bold",
        fontSize: "1.17em",
        marginBottom: -10
    },
    sandhi: {
        fontWeight: "bold",
        fontSize: "1.25em",
        marginRight: 5
    },
    tokenContainer: {
        display: "flex",
        flexDirection: "row",
        alignItems: "center"
    }
};
