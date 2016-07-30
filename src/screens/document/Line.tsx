import * as React from "react";
import { Models } from "vml-common";

import { DocumentStore } from "../../stores/documents";
import { Word } from "./Word";
import { observer } from "mobx-react";

interface LineProps {
    line: Models.Line;
    onWordClicked: any;
}

const Line = observer((props: LineProps) => {
    return (
        <span style={ styles.line }>
            {
                props.line.words.map(
                    (word, wordIndex) =>
                        <Word
                            word={ word }
                            onWordClicked={ (event, word) => props.onWordClicked(event, props.line.id, word) }
                            key={ word.id }
                            />
                )
            }
        </span>
    );
});

export { Line };

const styles = {
    line: {
        display: "flex",
        justifyContent: "center"
    }
};
