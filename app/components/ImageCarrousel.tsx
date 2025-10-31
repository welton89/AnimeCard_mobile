
import React, { useRef } from 'react';
import {
  View,
  Image,
  FlatList,
  Dimensions,
  StyleSheet,
  ListRenderItem,
  NativeSyntheticEvent,
  NativeScrollEvent,
} from 'react-native';

import { useTheme } from 'react-native-paper'; 
import { AppTheme } from '@app/themes/themes';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const ITEM_WIDTH = SCREEN_WIDTH;

interface ImageCarouselProps {
  data: string[];
  height?: number;
}

//  Componentes Dots 

const DotsIndicator: React.FC<{
  data: string[];
  currentIndex: number;
}> = ({ data, currentIndex }) => {
  const theme = useTheme() as AppTheme; 
  const activeColor = theme.colors.primary; 
  const inactiveColor = '#626262ff';
  return (
    <View style={styles.indicatorContainer}>
      {data.map((_, index) => (
        <View
          key={index.toString()}
          style={[
            styles.dot,
            { backgroundColor: index === currentIndex ? activeColor : inactiveColor },
            index === currentIndex && styles.activeDot,
          ]}
        />
      ))}
    </View>
  );
};

// --- Componente Principal ---

export const ImageCarousel: React.FC<ImageCarouselProps> = ({
  data,
  height = 200,
}) => {
  const scrollRef = useRef<FlatList<string>>(null);
  const [currentIndex, setCurrentIndex] = React.useState(0);
  

  const handleScroll = (
    event: NativeSyntheticEvent<NativeScrollEvent>,
  ) => {
    const contentOffsetX = event.nativeEvent.contentOffset.x;
    const newIndex = Math.round(contentOffsetX / ITEM_WIDTH);

    if (newIndex !== currentIndex) {
      setCurrentIndex(newIndex);
    }
  };


  const renderItem: ListRenderItem<string> = ({ item: uri }) => (
    <View style={{ width: ITEM_WIDTH, height: height }}>
      <Image
        source={{ uri: uri }}
        style={styles.image}
        resizeMode="cover"
      />
    </View>
  );

  return (
    <View style={styles.container}>
      <FlatList
        ref={scrollRef as React.RefObject<FlatList<string>>} 
        data={data}
        renderItem={renderItem}
        keyExtractor={(_, index) => index.toString()} // Usando '_' para item não usado
        horizontal
        showsHorizontalScrollIndicator={false}
        pagingEnabled
        onScroll={handleScroll}
        scrollEventThrottle={16}
        getItemLayout={(_, index) => ({
          length: ITEM_WIDTH,
          offset: ITEM_WIDTH * index,
          index,
        })}
      />
      { data.length > 1 && <DotsIndicator data={data} currentIndex={currentIndex} /> }
     
    </View>
  );
};


const styles = StyleSheet.create({
  container: { width: SCREEN_WIDTH, },
  image: { flex: 1, width: '100%', height: '100%', },
  indicatorContainer: { 
    flexDirection: 'row', 
    justifyContent: 'center', 
    marginTop: 10, 
    position: 'absolute', 
    bottom: 10,
    width: '100%', 
  },
  dot: { 
    height: 8, 
    width: 8, 
    borderRadius: 4, 
    marginHorizontal: 4, 
  },
  activeDot: { 
    width: 20, 
    height: 10, 
    borderRadius: 5, 
 },
});