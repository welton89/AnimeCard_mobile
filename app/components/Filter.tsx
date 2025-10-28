import * as React from 'react';
import { StyleSheet, View } from 'react-native';
import { SegmentedButtons } from 'react-native-paper';

interface FilterProps {
    filter:string;
    setFilter: (val:string)=> void;
    edit?:boolean

}

export const  Filter = ({filter, setFilter,edit}:FilterProps) => {
  return (
    <View style={styles.container}>
      <SegmentedButtons
        value={filter}
        onValueChange={setFilter}
        buttons={
            
            !edit ?
            [
          {value: 'all', label: 'Todos',},
          {value: 'list', label: 'Lista' },
          {value: 'watching', label: 'Assistindo' },
          {value: 'finish',  label: 'Finalizados' },
        ]
        :
         [
          {value: 'list', label: 'Lista' },
          {value: 'watching', label: 'Assistindo' },
          {value: 'finish',  label: 'Finalizados' },
        ]
    
    }
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    minHeight:40,
    width:'100%',
    alignItems: 'center',
  },
});

