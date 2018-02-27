import React, { Component } from 'react';
import { WebView } from 'react-native';
import { canvasHtml } from './canvas-html';
import RNFetchBlob from 'react-native-fetch-blob';


export default class ImageColorPicker extends Component {

  constructor(props) {
    super(props);
    this.loggingIn = false;
    this.state = {
      imageBlob: '',
    };
  }

  componentWillMount() {
    if (typeof this.props.imageBlob !== 'undefined') {
      this.setState({ imageBlob: this.props.imageBlob });
    } else {
      this.getImage(this.props.imageUrl);
    }
  }

  getImage = async imageUrl => {
    try {
      await RNFetchBlob.fetch('GET', imageUrl)
        .then(res => {
          this.setState({ imageBlob: res.base64() }, () => {
            this.generateHTML();
          });
        })
        .catch((errorMessage, statusCode) => {
          this.props.pickerCallback(errorMessage, statusCode);
        });
    } catch (e) {
      this.props.pickerCallback(e);
    }
  }

  generateHTML = () => {
    const html = canvasHtml(this.state.imageBlob, this.props);
    this.setState({ html });
  }

  render() {
    const { imageUrl, pickerCallback, pickerStyle } = this.props;
    const { html } = this.state;

    return (
      <WebView
        ref="imageColorPickerWebview"
        source={{ html: html }}
        javaScriptEnabled={true}
        onMessage={pickerCallback}
        style={pickerStyle}
      />
    );
  }
}
