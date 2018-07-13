import React, { Component } from 'react';
import { View, Animated, PanResponder } from 'react-native';

class Deck extends Component {
  constructor(props) {
    super(props);
    const panResponder = PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onPanResponderMove: (event, gesture) => {
        console.log(gesture);
        // this gesture object in memory is being reused by react/react-native every time we call onPanResponderMove
        // it is reset immediately as we exit this function
      },
      onPanResponderRelease: () => {}
    });
    // panResponder is a self-contained object - it will never be involved with the state system
    this.state = { panResponder };
  }
  renderCards() {
    return this.props.data.map(card => {
      return this.props.renderCard(card);
    });
  }

  render() {
    return <View {...this.state.panResponder.panHandlers}> {this.renderCards()}</View>;
  }
}

export default Deck;
