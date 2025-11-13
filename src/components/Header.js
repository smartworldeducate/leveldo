// components/Header.js
import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { ArrowLeft } from 'lucide-react-native';
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';

const Header = ({ navigation, title, showBack = true }) => {
  return (
  
      <View style={styles.headerContent}>
        {showBack ? (
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <ArrowLeft color="#fff" size={24} />
          </TouchableOpacity>
        ) : (
          <View style={styles.backButtonPlaceholder} />
        )}
        <Text style={styles.title}>{title}</Text>
        <View style={styles.rightPlaceholder} />
      </View>

  );
};

export default Header;

const styles = StyleSheet.create({
  header: {
    // paddingTop: hp('5%'),
    // paddingBottom: hp('2%'),
    marginHorizontal: wp('5%'),
    // borderBottomLeftRadius: 20,
    // borderBottomRightRadius: 20,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  backButton: {
    padding: 6,
  },
  backButtonPlaceholder: {
    width: 30,
  },
  title: {
    color: '#fff',
    fontSize: hp('2.4%'),
    fontWeight: '600',
  },
  rightPlaceholder: {
    width: 30,
  },
});
