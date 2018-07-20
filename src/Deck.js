import React, { Component } from 'react';
import { View, Animated, PanResponder, Dimensions, LayoutAnimation, UIManager } from 'react-native';

const SCREEN_WIDTH = Dimensions.get('window').width;
const SWIPE_THRESHOLD = 0.6 * SCREEN_WIDTH;
const SWIPE_OUT_DURATION = 250;

class Deck extends Component {
  static defaultProps = {
    onSwipeRight: () => {},
    onSwipeLeft: () => {}
  };

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
          this.forceSwipe('right');
        } else if (gesture.dx < -SWIPE_THRESHOLD) {
          this.forceSwipe('left');
        } else {
          this.resetPosition();
        }
      }
    });

    this.state = { panResponder, position, index: 0 }; //ewww
  }

  //WARNING! To be deprecated in React v17. Use new lifecycle static getDerivedStateFromProps instead.
  // componentWillReceiveProps(nextProps) {
  //   if (nextProps.data !== this.props.data) {
  //     this.setState({ index: 0 });
  //   }
  // }

  static getDerivedStateFromProps(nextProps, prevState) {
    if (nextProps.data !== prevState.data) {
      return { ...prevState, index: 0 };
    }
  }

  componentDidUpdate() {
    UIManager.setLayoutAnimationEnabledExperimental && UIManager.setLayoutAnimationEnabledExperimental(true);
    LayoutAnimation.spring();
  }

  forceSwipe(direction) {
    const x = direction === 'right' ? SCREEN_WIDTH : -SCREEN_WIDTH;
    Animated.timing(this.state.position, { toValue: { x, y: 0 }, duration: SWIPE_OUT_DURATION }).start(() => {
      this.onSwipeComplete(direction);
    });
  }

  onSwipeComplete(direction) {
    const { onSwipeLeft, onSwipeRight, data } = this.props;
    const item = data[this.state.index];

    const x = direction === 'right' ? onSwipeRight(item) : onSwipeLeft(item);
    this.state.position.setValue({ x: 0, y: 0 });
    this.setState({ index: this.state.index + 1 });
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
    if (this.state.index >= this.props.data.length) {
      return this.props.renderNoMoreCards();
    }
    return this.props.data
      .map((card, i) => {
        if (i < this.state.index) {
          return null;
        }
        if (i === this.state.index) {
          return (
            <Animated.View
              key={card.id}
              style={[this.getCardStyle(), styles.cardStyle]}
              {...this.state.panResponder.panHandlers}
            >
              {this.props.renderCard(card)}
            </Animated.View>
          );
        }
        return (
          <Animated.View key={card.id} style={[styles.cardStyle, { top: 10 * (i - this.state.index) }]}>
            {this.props.renderCard(card)}
          </Animated.View>
        );
      })
      .reverse();
  }

  render() {
    return <View>{this.renderCards()}</View>;
  }
}

const styles = {
  cardStyle: {
    position: 'absolute',
    width: SCREEN_WIDTH
  }
};

export default Deck;
