import * as React from "react";
import { sortable } from "react-anything-sortable";
import { observer } from "mobx-react";

@sortable
@observer
export class SortableToken extends React.Component<any, any> {
    render() {
        return (
            <div {...this.props }>
                { this.props.children }
            </div>
        );
    }
}