import React, { Component } from 'react';
import { View, Animated, PanResponder, Dimensions } from 'react-native';

const SCREEN_WIDTH = Dimensions.get('window').width;
const SWIPE_THRESHOLD = 0.6 * SCREEN_WIDTH;
const SWIPE_OUT_DURATION = 250;

class Deck extends Component {
  constructor(props) {
    super(props);

    const position = new Animated.ValueXY();
    const panResponder = PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onPanResponderMove: (event, gesture) => {
        position.setValue({ x: gesture.dx });
      },
      onPanResponderRelease: (event, gesture) => {
        if (gesture.dx > SWIPE_THRESHOLD) {
          this.forceSwipeRight();
        } else if (gesture.dx < -SWIPE_THRESHOLD) {
          this.forceSwipeLeft();
        } else {
          this.resetPosition();
        }
      }
    });

    this.state = { panResponder, position }; //ewww
  }

  forceSwipeLeft() {
    Animated.timing(this.state.position, { toValue: { x: -SCREEN_WIDTH, y: 0 }, duration: SWIPE_OUT_DURATION }).start();
  }

  forceSwipeRight() {
    Animated.timing(this.state.position, { toValue: { x: SCREEN_WIDTH, y: 0 }, duration: SWIPE_OUT_DURATION }).start();
  }

  resetPosition() {
    Animated.spring(this.state.position, { toValue: { x: 0, y: 0 } }).start();
  }

  getCardStyle() {
    const { position } = this.state;
    const rotate = position.x.interpolate({
      inputRange: [-SCREEN_WIDTH, 0, SCREEN_WIDTH],
      outputRange: ['-90deg', '0deg', '90deg']
    });
    return {
      ...position.getLayout(),
      transform: [{ rotate }]
    };
  }

  renderCards() {
    return this.props.data.map((card, index) => {
      if (index === 0) {
        return (
          <Animated.View key={card.id} style={this.getCardStyle()} {...this.state.panResponder.panHandlers}>
            {this.props.renderCard(card)}
          </Animated.View>
        );
      }
      return this.props.renderCard(card);
    });
  }

  render() {
    return <View>{this.renderCards()}</View>;
  }
}

export default Deck;
