import React from 'react';

import 'brace/theme/github';
import 'brace/mode/javascript';
import 'brace/snippets/javascript';
import 'brace/ext/language_tools';

import { EuiCodeEditor } from '@elastic/eui';

class Editor extends React.Component {
  state = {
    value: '',
  };

  onChange = value => {
    this.setState({ value });
  };

  render() {
    return (
      <EuiCodeEditor
        mode="javascript"
        theme="github"
        width="100%"
        value={this.state.value}
        onChange={this.onChange}
        setOptions={{
          fontSize: '14px',
          enableBasicAutocompletion: true,
          enableSnippets: true,
          enableLiveAutocompletion: true,
        }}
        onBlur={() => {
          console.log(this.state.value);
        }} 
        aria-label="Code Editor"
      />
    );
  }
}

export default Editor;