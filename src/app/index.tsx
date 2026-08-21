import { useState } from 'react';
import { StyleSheet } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

import { NotesList } from '@/components/notes-list';
import { PatternGate } from '@/components/pattern-gate';
import { SlidePanel } from '@/components/slide-panel';
import { ThemedView } from '@/components/themed-view';
import { Strings } from '@/constants/strings';

type Hidden = { open: boolean; unlocked: boolean; changingPattern: boolean };

const CLOSED: Hidden = { open: false, unlocked: false, changingPattern: false };

export default function NotesScreen() {
  // Panel her kapanışta kilitleniyor: `unlocked` burada sıfırlanıyor, yani
  // gizli notlara dönmek her seferinde deseni yeniden istiyor.
  const [hidden, setHidden] = useState<Hidden>(CLOSED);

  return (
    <ThemedView style={styles.container}>
      <NotesList
        title={Strings.notes.title}
        menuExtra={{
          title: Strings.hidden.title,
          description: Strings.hidden.menuDescription,
          onPress: () => setHidden({ open: true, unlocked: false, changingPattern: false }),
        }}
      />

      <SlidePanel visible={hidden.open} onRequestClose={() => setHidden(CLOSED)}>
        {/* Modal içindeki hareketler kendi kökünü ister; bu olmadan gizli
            listede sürükleyerek sıralama çalışmaz. */}
        <GestureHandlerRootView style={styles.container}>
          {hidden.unlocked && !hidden.changingPattern ? (
            <NotesList
              hidden
              title={Strings.hidden.title}
              onBack={() => setHidden(CLOSED)}
              menuExtra={{
                title: Strings.hidden.changePattern,
                description: Strings.hidden.changePatternDescription,
                onPress: () => setHidden({ open: true, unlocked: true, changingPattern: true }),
              }}
            />
          ) : (
            <ThemedView style={styles.container}>
              <PatternGate
                forceCreate={hidden.changingPattern}
                onUnlock={() => setHidden({ open: true, unlocked: true, changingPattern: false })}
              />
            </ThemedView>
          )}
        </GestureHandlerRootView>
      </SlidePanel>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
