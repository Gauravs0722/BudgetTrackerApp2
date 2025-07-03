
import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, FlatList, Modal, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import tw from 'twrnc';
import { Plus, Trash } from 'lucide-react-native';

// Entry type: { id: string, type: 'income'|'expense', amount: number, category: string, note?: string, date: string }

export default function App() {
  const [entries, setEntries] = useState([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [form, setForm] = useState({ type: 'expense', amount: '', category: '', note: '' });

  useEffect(() => {
    (async () => {
      const saved = await AsyncStorage.getItem('@entries');
      if (saved) setEntries(JSON.parse(saved));
    })();
  }, []);

  useEffect(() => {
    AsyncStorage.setItem('@entries', JSON.stringify(entries));
  }, [entries]);

  const addEntry = () => {
    const amt = parseFloat(form.amount);
    if (!amt || !form.category) {
      Alert.alert('Please fill amount & category');
      return;
    }
    const newEntry = {
      id: Date.now().toString(),
      ...form,
      amount: amt,
      date: new Date().toISOString(),
    };
    setEntries([newEntry, ...entries]);
    setForm({ type: 'expense', amount: '', category: '', note: '' });
    setModalVisible(false);
  };

  const deleteEntry = (id) => setEntries(entries.filter((e) => e.id !== id));

  const incomeTotal = entries.filter(e => e.type === 'income').reduce((s, e) => s + e.amount, 0);
  const expenseTotal = entries.filter(e => e.type === 'expense').reduce((s, e) => s + e.amount, 0);
  const balance = incomeTotal - expenseTotal;

  return (
    <View style={tw\`flex-1 bg-gray-100 p-4\`}>     
      <Text style={tw\`text-3xl font-bold text-center mb-4\`}>My Budget Tracker</Text>

      {/* Summary Cards */}
      <View style={tw\`flex-row justify-around mb-4\`}>
        <View style={tw\`bg-green-100 p-4 rounded-2xl w-28\`}>
          <Text style={tw\`text-sm text-gray-600\`}>Income</Text>
          <Text style={tw\`text-xl font-bold\`}>₹{incomeTotal}</Text>
        </View>
        <View style={tw\`bg-red-100 p-4 rounded-2xl w-28\`}>
          <Text style={tw\`text-sm text-gray-600\`}>Expense</Text>
          <Text style={tw\`text-xl font-bold\`}>₹{expenseTotal}</Text>
        </View>
        <View style={tw\`bg-blue-100 p-4 rounded-2xl w-28\`}>
          <Text style={tw\`text-sm text-gray-600\`}>Balance</Text>
          <Text style={tw\`text-xl font-bold\`}>₹{balance}</Text>
        </View>
      </View>

      {/* List */}
      <FlatList
        data={entries}
        keyExtractor={(item) => item.id}
        contentContainerStyle={tw\`pb-20\`}
        renderItem={({ item }) => (
          <View style={tw\`flex-row justify-between items-center bg-white p-3 mb-2 rounded-xl shadow\`}>           
            <View>
              <Text style={tw\`text-base ${item.type === 'income' ? 'text-green-700' : 'text-red-700'}\`}>₹{item.amount}</Text>
              <Text style={tw\`text-xs text-gray-600\`}>{item.category}</Text>
            </View>
            <TouchableOpacity onPress={() => deleteEntry(item.id)}>
              <Trash size={20} color="gray" />
            </TouchableOpacity>
          </View>
        )}
        ListEmptyComponent={<Text style={tw\`text-center text-gray-500 mt-10\`}>No entries yet</Text>}
      />

      {/* Add Button */}
      <TouchableOpacity onPress={() => setModalVisible(true)} style={tw\`absolute bottom-8 right-8 bg-blue-600 p-4 rounded-full shadow-xl\`}>
        <Plus size={24} color="white" />
      </TouchableOpacity>

      {/* Modal */}
      <Modal visible={modalVisible} transparent animationType="slide" onRequestClose={() => setModalVisible(false)}>
        <View style={tw\`flex-1 bg-black/50 justify-center items-center p-4\`}>
          <View style={tw\`bg-white w-full rounded-2xl p-6\`}>           
            <Text style={tw\`text-xl font-bold mb-4\`}>Add Entry</Text>

            {/* Type switch */}
            <View style={tw\`flex-row mb-3\`}>
              {['income', 'expense'].map(t => (
                <TouchableOpacity key={t} onPress={() => setForm({ ...form, type: t })} style={tw\`flex-1 p-2 rounded-xl ${form.type===t?'bg-blue-600':'bg-gray-200'} mx-1\`}>
                  <Text style={tw\`text-center ${form.type===t?'text-white':'text-gray-800'}\`}>{t.charAt(0).toUpperCase()+t.slice(1)}</Text>
                </TouchableOpacity>
              ))}
            </View>

            <TextInput
              placeholder="Amount (₹)"
              keyboardType="numeric"
              value={form.amount}
              onChangeText={(v) => setForm({ ...form, amount: v })}
              style={tw\`border border-gray-300 rounded-xl p-3 mb-3\`}
            />
            <TextInput
              placeholder="Category (e.g. Rent, Salary)"
              value={form.category}
              onChangeText={(v) => setForm({ ...form, category: v })}
              style={tw\`border border-gray-300 rounded-xl p-3 mb-3\`}
            />
            <TextInput
              placeholder="Note (optional)"
              value={form.note}
              onChangeText={(v) => setForm({ ...form, note: v })}
              style={tw\`border border-gray-300 rounded-xl p-3 mb-3\`}
            />

            <View style={tw\`flex-row justify-between\`}>             
              <TouchableOpacity onPress={() => setModalVisible(false)} style={tw\`flex-1 mr-2 bg-gray-200 p-3 rounded-xl\`}>
                <Text style={tw\`text-center\`}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={addEntry} style={tw\`flex-1 ml-2 bg-blue-600 p-3 rounded-xl\`}>
                <Text style={tw\`text-center text-white\`}>Save</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}
