
app.firstScene = "dream";

app.scenes = {
  dream: {
    initial: true,
    spell: false,
    onEnter: function(self) {
      if (self.initial) {
        self.initial = false;
        app.playSequence('fortress');
      } else {
        app.playSequence('garden');
      }
    },
    sequences: {
      fortress: {
        onBegin: function(self) {
        },
        beats: [
          'A dark fortress towers above you - alone in an otherwise featureless wasteland. Its jagged, black spires thrusting cruelly into the sky.',
          'You find yourself irresistably drawn towards the ominous structure.',
          'As you pass under its black portcullis you feel somewhat uneasy.',
          'The desire to turn and flee is overwhelming. Your body, however, has other plans.',
          'Your feet pull you onward down a long flight of stone steps, descending for what seems like an eternity into unknown black depths.',
          'Suddenly the stairs end. Stumbling forward you bang into a solid wooden door.',
          'Opening the door, quite to your surprise, you discover an idyllic, sunlit garden.',
          '"This is a rather pleasant scene", you think to yourself.',
          'You regret that thought.',
          'Something dark and hideous appears before you. A creature whose bizarre physical characteristics defy description.',
          'It looks directly at you and lets out an ear-splitting screech.'
        ],
        onEnd: function(self) {
          app.goScene('room');
        }
      },
      garden: {
        onBegin: function(self) {
        },
        beats: [
          "Once again you enter the black fortress and make your way to the sunlit garden.",
          "The creature appears as before. It turns to face you and screeches. The sound is unbearable.",
          "You have the strange feeling that this \"thing\" is trying to communicate with you."
        ],
        onEnd: function(self) {
          if (app.scene.spell) {
            app.goScene("garden");
          } else {
            app.goScene('room');
          }
        }
      }
    }
  },
  garden: {
    title: 'Garden',
    initial: true,
    onEnter: function(self) {
      if (self.initial) {
        self.initial = false;
        app.playSequence("creature");
      }
    },
    sequences: {
      creature: {
        onBegin: function(self) {
        },
        beats: [
          'Without thinking you recite the words of the spell you discovered in the mysterious book. "Adnazum kazar morgoth fryde chik\'n."',
          'The dark horror suddenly stops screeching.',
          '"Thank you, old chap", the creature says with an expression of gratitude on what you can only assume is its face.',
          '"It\'s good to have one\'s voice again. Screech, screech, screech all day long. It really was getting rather tiresome."',
          '"That blasted wizard, Roderick, cursed me. He\'s always envied my singing voice you see."',
          '"Still nevermind. I was sent here to pass on a message to you."',
          '"Happy Birthday!", it declares. "Whatever that means."',
          '"Anyway must dash. Cheerio and all that."',
          'The creature promptly disappears in a puff of black smoke.'
        ],
        onEnd: function(self) {
          app.goScene("ending");
        }
      }
    }
  },
  ending: {
    title: 'THE END',
    snippets: {
      1: {
        text: "Well that's all for now. Hopefully the clunky writing was tolerable. Further adventures may follow. Perhaps involving that dastardly wizard, Roderick.",
        items: []
      }
    }
  },
  room: {
    title: 'White Room',
    initial: true,
    asleep: true,
    onEnter: function(self) {
      if (self.asleep) {
        if (self.initial) {
          app.playSequence('awaken');
        } else {
          app.playSequence('awaken2');
        }
      }
    },
    sequences: {
      awaken: {
        onBegin: function(self) {
        },
        beats: [
          'You awaken with a gasp.',
          '"Only a dream", you think to yourself with some relief.',
          'Slowly your surroundings come into focus.',
          // 'Whiteness in every direction.',
          'Beneath you, a comfortable bed.',
          'You do not recognise this place.'
        ],
        onEnd: function(self) {
          app.scene.initial = false;
          app.scene.asleep = false;
          app.goScene('room');
        }
      },
      awaken2: {
        onBegin: function(self) {
        },
        beats: [
          'You awaken.'
        ],
        onEnd: function(self) {
          app.scene.asleep = false;
          app.goScene('room');
        }
      }
    },
    snippets: {
      1: {
        text: "Featureless white walls stare back at you on all sides. A <bed> occupies the center of the space.",
        items: [ "bed" ]
      },
      2: {
        hidden: true,
        text: "Underneath the bed you can see a <small rectangular object>.",
        items: [ "book" ]
      },
      3: {
        text:  "There is no apparent way in or out of this room.",
        items: []
      }
    },
    items: {
      bed: {
        text: 'bed',
        made: false,
        verbs: {
          examine: {
            handler: function(self) {
              if (app.scene.items["book"].hidden) {
                app.displayMessage("It is wholely unremarkable as beds go. You can't remember a better sleep though. Something lies on the floor underneath it.");
                app.scene.items["book"].hidden = false;
                app.scene.snippets["2"].hidden = false;
                app.scene.snippets["2"].highlight = true;
              } else {
                app.displayMessage("An unremarkable bed.");
              }
            }
          },
          sleep: {
            handler: function(self) {
              app.scene.asleep = true;
              app.goScene("dream");
            }
          }
        }
      },
      book: {
        text: "book",
        hidden: true,
        opened: false,
        verbs: {
          examine: {
            handler: function(self) {
              if (!self.identified) {
                app.displayMessage("Upon closer inspection you determine the object to be a book. The title on the cover reads: Fizgig's Arcane Incantations - Volume 1.");
                app.scene.snippets["2"].hidden = true;
                self.identified = true;
                self.highlight = true;
                self.verbs["read"].hidden = false;
                self.verbs["examine"].hidden = true;
              } else {
                app.displayMessage("It is a book.");
              }
            }
          },
          read: {
            hidden: true,
            handler: function(self) {
              if (!self.opened) {
                app.displayMessage("It appears to be a book of magical spells and incantations. One spell in particular catches your eye. It purports to remove magical curses. Thinking it may come in handy you memorise the words.");
                app.scenes["dream"].spell = true;
                self.opened = true;
              } else {
                app.displayMessage("Fizgig's Arcane Incantations - Volume 1. It is a book of magical spells. You have memorized a spell to remove magical curses.");
              }
            }
          }
        }
      }
    },
    onExit: function(self) {
    }
  }
}
