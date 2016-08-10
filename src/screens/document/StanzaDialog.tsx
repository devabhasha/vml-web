import * as React from "react";
import { Dialog, Popover, FlatButton, LinearProgress } from "material-ui";
const Sortable = require("react-anything-sortable");
import { observer, inject } from "mobx-react";
import { observable, action, computed, toJS } from "mobx";
import { translit, getLightColour } from "../../shared/utils";
import { Models } from "vml-common";

import { AppState, StanzaStore, DocumentStore } from "../../stores";
import { SortableToken } from "./SortableToken";
import { WordPopover } from "./WordPopover";
import { Line } from "./Line";

interface StanzaDialogProps {
    open: boolean;
    stanza: Models.Stanza;
    onRequestClose: React.EventHandler<any>;
    onSaveParagraph: any;
    runningStanzaId: string;
    appState?: AppState;
    stanzaStore?: StanzaStore;
    documentStore?: DocumentStore;
}

@inject("appState", "stanzaStore", "documentStore")
@observer
export class StanzaDialog extends React.Component<StanzaDialogProps, {}> {
    @observable wordPopoverOpen: boolean;
    @observable anchorEl: any;
    @observable localTokens: Models.Token[];
    @observable analyseClicked: boolean;

    @action
    setWordPopoverOpen = (open: boolean) => {

        this.wordPopoverOpen = open;
    }

    @action
    setAnchorEl = (anchorEl: any) => {

        this.anchorEl = anchorEl;
    }

    @action
    handleAnalyseClicked = () => {

        this.analyseClicked = true;
        this.setLocalTokens(this.getTokens(this.props.appState.editedStanza));
    }

    @action
    setLocalTokens = (tokens: Models.Token[]) => {

        this.localTokens = tokens;
    }

    @action
    initAnalyseClicked = () => {

        this.analyseClicked = true;
    }

    @computed
    get analyseButtonDisabled() {

        const stanza = this.props.appState.editedStanza;

        if (!stanza) {
            return true;
        }

        return stanza.lines.some(line => line.words.some(word => !word.analysis));
    }

    getTokens = (stanza: Models.Stanza) => {

        if (this.analyseButtonDisabled) {
            return;
        }

        const analysedTokens: Models.Token[] = [];

        stanza.lines.forEach(line => {

            line.words.forEach(word => {

                word.analysis.forEach(token => {

                    analysedTokens.push(token);
                });
            });
        });

        return analysedTokens;
    }

    handleRequestClose = (event) => {

        if (this.wordPopoverOpen) {
            return;
        }

        this.props.onRequestClose(event);
    }

    getDialogActions(): JSX.Element[] {

        return [
            <FlatButton
                label="Cancel"
                secondary
                onTouchTap={ this.props.onRequestClose }
                />,
            <FlatButton
                label="Save"
                primary
                onTouchTap={ this.updateStanza }
                />
        ];
    }

    updateStanza = () => {

        const { stanzaStore, documentStore } = this.props;
        const { editedStanza } = this.props.appState;
        editedStanza.analysis = this.localTokens;
        stanzaStore.tryUpdatingStanza(documentStore.shownDocument.url, editedStanza.runningId, editedStanza);
        this.props.onSaveParagraph();
    }

    handleWordClicked = (event: React.TouchEvent) => {

        event.preventDefault();
        this.setAnchorEl(event.currentTarget);
        this.setWordPopoverOpen(true);
    }

    handleProcessWordAnalysis = (event) => {

        this.setWordPopoverOpen(false);
        this.props.appState.unsetEditedWord();
        this.setLocalTokens(this.getTokens(this.props.appState.editedStanza));
    }

    getDialogChildren() {

        const { appState } = this.props;

        return (
            <div>
                <p style={ styles.paragraph }>
                    {
                        appState.editedStanza.lines.map((line, lineIndex) => {
                            return lineIndex > 0 ?
                                React.Children.toArray([
                                    <br />,
                                    <Line line={ line } onWordClicked={ this.handleWordClicked } key={ line.id }/>
                                ])
                                : <Line line={ line } onWordClicked={ this.handleWordClicked } key={ line.id }/>;
                        })
                    }
                </p>
                <div style={ styles.analyseButton }>
                    <FlatButton label="Analyse" primary disabled={ this.analyseButtonDisabled } onTouchTap={ this.handleAnalyseClicked } />
                </div>
                <div style={ styles.showAnalysis(this.analyseClicked || appState.editedStanza.analysis) }>
                    <Sortable onSort={ this.setLocalTokens } dynamic>
                        {
                            this.localTokens && this.localTokens.map((token, tokenIndex) => {

                                return (
                                    <SortableToken sortData={ token } key={ tokenIndex }>
                                        <span style={ Object.assign({ backgroundColor: getLightColour(tokenIndex) }, styles.analysedToken) } >
                                            { translit(token.token) }
                                        </span>
                                    </SortableToken>
                                );
                            })
                        }
                    </Sortable>
                </div>
            </div>
        );
    }

    componentWillReceiveProps(nextProps: StanzaDialogProps) {

        if (nextProps.stanza) {

            nextProps.appState.setEditedStanza(nextProps.stanza);

            if (nextProps.stanza.analysis) {

                this.setLocalTokens(Object.assign([], toJS(nextProps.stanza.analysis)));
                this.initAnalyseClicked();
            }
        }
        else {
            this.setLocalTokens([]);
        }
    }

    render() {

        if (!this.props.stanza) {
            return (
                <div>
                    <Dialog
                        title={ `Verse ${this.props.runningStanzaId}` }
                        open={ this.props.open }
                        contentStyle={ styles.dialogStyle }
                        bodyStyle={ styles.dialogBodyStyle }
                        children={ <LinearProgress mode="indeterminate" style={ styles.loadProgress } /> }
                        />
                </div>
            );
        }

        const { appState } = this.props;

        return (
            <div>
                <Dialog
                    title={ `Verse ${appState.editedStanza.runningId}` }
                    children={ this.getDialogChildren() }
                    actions={ this.getDialogActions() }
                    open={ this.props.open }
                    onRequestClose={ this.handleRequestClose }
                    bodyStyle={ styles.dialogBodyStyle }
                    contentStyle={ styles.dialogStyle }
                    autoScrollBodyContent
                    />
                <Popover
                    open={ this.wordPopoverOpen }
                    anchorEl={ this.anchorEl }
                    anchorOrigin={ { horizontal: "left", vertical: "top" } }
                    targetOrigin={ { horizontal: "right", vertical: "center" } }
                    onRequestClose={ () => this.setWordPopoverOpen(false) }
                    canAutoPosition
                    autoCloseWhenOffScreen={ false }
                    children={
                        <WordPopover
                            word={ appState.editedWord }
                            onSaveWordAnalysis={ this.handleProcessWordAnalysis }
                            onTouchTapCancel={ () => this.setWordPopoverOpen(false) }
                            />
                    }
                    />
            </div>
        );
    }
}

const styles = {
    paragraph: {
        fontSize: "1.5em",
        textAlign: "center"
    },
    analyseButton: {
        textAlign: "center"
    },
    analysedToken: {
        padding: 5,
        fontSize: "1.75em",
        margin: 5
    },
    showAnalysis: (show) => {

        const style = {
            marginTop: 24,
            padding: "0 40px",
            lineHeight: "3em"
        };

        if (show) {
            Object.assign(style, {
                display: "flex",
                flexWrap: "wrap"
            });
        } else {
            Object.assign(style, {
                display: "none"
            });
        }
        return style;
    },
    dialogStyle: {
        position: "absolute",
        top: 0,
        right: 0,
        left: 0
    },
    dialogBodyStyle: {
        color: "inherit",
        paddingBottom: 20
    },
    loadProgress: {
        margin: "0 -24px",
        width: "auto"
    }
};
