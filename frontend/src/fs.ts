export type FileNode =
  | { kind: 'folder'; name: string; icon?: string; children: FileNode[]; password?: string }
  | { kind: 'text'; name: string; content: string; modified?: string }
  | { kind: 'image'; name: string; caption: string; scene: string }
  | { kind: 'exe'; name: string; action: string; icon?: string }
  | { kind: 'link'; name: string; url: string }

const diary = `DIARY - RAHUL KUMAR, CLASS 11-B
(property of rahul. MUMMY THIS MEANS YOU)

12 Mar 1999
Papa finally bought the computer!! Pentium 166 MMX, 32 MB RAM.
Uncle said "itna RAM kya karega, NASA chalayega?"
Dial-up connects only after 11pm because phone bill.

3 Apr 1999
Made my own website on GeoCities. 14 visitors. 11 were me.

20 Jun 1999
Watched CID with Dadi. ACP sir said "kuch toh gadbad hai"
and Dadi looked at my report card. coincidence?? i think not.

15 Aug 1999
Chain mail said forward to 10 people or Sachin gets out for 0.
I forwarded to 25. He made 140. You're welcome, India.

2 Nov 1999
Cool_dude_99 says Y2K will make every computer explode at midnight.
Started my survival plan. See y2k_survival_plan.txt

31 Dec 1999, 11:58 pm
if anyone finds this computer... it was nice knowing you.
going to nani's house. DO NOT OPEN THE PRIVATE FOLDER.
`

const y2k = `Y2K SURVIVAL PLAN (TOP SECRET)
1. Remove computer plug at 11:59 pm  [ ]
2. Store 40 packets Maggi            [x]
3. Hide report card in System32      [x]  (computer will explode anyway)
4. Learn "Om Shanti Om" in case of apocalypse  [ ]
5. Tell Pinky my feelings before world ends   [ ] [ ] [ ]  (scared)
6. Ask Shaktimaan for help                    [x]  (no reply. sorry shaktimaan)
`

const dontOpen = `ok you opened it.

now Mummy knows.

(she always knows)`

const report = `ANNUAL REPORT CARD 1998-99
Name: Rahul Kumar     Class: 11-B

Maths ........ 98   <- (font looks different?? no it doesn't)
Physics ...... 97   <- (edited in Paint, NOT edited in Paint)
Chemistry .... 99
English ...... 34   <- ok this one is real

Teacher's remark: "Very talented. In MS Paint."
`

const chat = `*** Chat log: rahul_rocks_1999 <-> cool_dude_99 ***

cool_dude_99: asl?
rahul_rocks_1999: 16/m/bhilai. u?
cool_dude_99: 16/m/ur neighbour. i can see ur window
rahul_rocks_1999: PINTU??
cool_dude_99: lol
cool_dude_99: listen. Y2K is REAL. 1999 + 1 = 1900 for computers
cool_dude_99: all money will become zero
rahul_rocks_1999: i have 40 rs total
cool_dude_99: then u have nothing to lose. invest in Lakshmi Chit Fund
cool_dude_99: 21 din mein paisa double
rahul_rocks_1999: sounds legit
cool_dude_99: brb mummy is calling
cool_dude_99 has gone offline. (since 1999)
`

const loveLetter = `Dear Pinky,

Since the day you borrowed my Physics notes in 9th class
(you never returned them, it is ok, i forgave you),
I think about you more than Doordarshan thinks about
"rukawat ke liye khed hai".

If the world survives Y2K, will you come to the Shaktimaan
screening on Sunday 12 pm?

Yours (only if you say yes),
Rahul

P.S. If you say no, this letter was written by Pintu.
`

const kokila = `kokilaben.txt
Last modified: 15-Aug-2020 ??????

"Rasode mein kaun tha?"

How is this file here. This computer was switched off in 1999.
Who put this here.
...
Rashi thi.
`

const recycleLetter = `My dear Sir/Madam,
I am Prince Adebayo, nephew of the King of Lakshmi Chit Fund.
I have 25,00,000 rupees stuck in a bank in Bhilai.
Please send Rs 40 for processing fee.
Paisa 21 din mein double. Guaranteed by Baburao.
`

export const drive: FileNode = {
  kind: 'folder', name: 'C:', children: [
    { kind: 'folder', name: 'My Documents', icon: '📁', children: [
      { kind: 'text', name: 'diary_1999.txt', content: diary },
      { kind: 'text', name: 'y2k_survival_plan.txt', content: y2k },
      { kind: 'text', name: 'DO_NOT_OPEN.txt', content: dontOpen },
      { kind: 'text', name: 'report_card_FINAL_final2.txt', content: report },
      { kind: 'text', name: 'chat_cool_dude_99.log', content: chat },
      { kind: 'folder', name: 'Private', password: 'pinky', children: [
        { kind: 'text', name: 'letter_for_pinky.txt', content: loveLetter },
        { kind: 'text', name: 'kokilaben.txt', content: kokila },
      ] },
    ] },
    { kind: 'folder', name: 'My Pictures', icon: '🖼️', children: [
      { kind: 'image', name: 'world_cup_1999.jpg', scene: 'cricket', caption: 'Watched World Cup 1999 on Uncle\'s colour TV. Antenna held by me for 3 hours.' },
      { kind: 'image', name: 'shimla_trip_98.jpg', scene: 'mountains', caption: 'Shimla trip 1998. Papa said "smile" 47 times. Film roll finished on photo 3.' },
      { kind: 'image', name: 'me_cool_sunglasses.jpg', scene: 'selfie', caption: 'Me trying the Baburao style. Mummy confiscated sunglasses.' },
      { kind: 'image', name: 'titanic_poster.jpg', scene: 'ship', caption: 'Saw Titanic 4 times. Cried 4 times. Told everyone it was dust.' },
    ] },
    { kind: 'folder', name: 'Games', icon: '🎮', children: [
      { kind: 'exe', name: 'GTA3.exe', action: 'gta', icon: '🚗' },
      { kind: 'exe', name: 'mine_sweeper.exe', action: 'mines', icon: '💣' },
      { kind: 'exe', name: 'cricket_99.exe', action: 'cricket', icon: '🏏' },
    ] },
    { kind: 'folder', name: 'Program Files', icon: '📁', children: [
      { kind: 'folder', name: 'Lakshmi Chit Fund', icon: '💰', children: [
        { kind: 'exe', name: 'paisa_double.exe', action: 'chitfund', icon: '💸' },
      ] },
      { kind: 'folder', name: 'Internet Explorer', icon: '📁', children: [
        { kind: 'exe', name: 'iexplore.exe', action: 'ie', icon: '🌐' },
      ] },
    ] },
    { kind: 'folder', name: 'Windows', icon: '📁', children: [
      { kind: 'folder', name: 'System32', icon: '⚙️', children: [
        { kind: 'text', name: 'report_card_HIDDEN.txt', content: report },
        { kind: 'exe', name: 'DELETE_SYSTEM32.exe', action: 'bsod', icon: '🗑️' },
      ] },
    ] },
  ],
}

export const recycleBin: FileNode[] = [
  { kind: 'text', name: 'prince_email.txt', content: recycleLetter },
  { kind: 'text', name: 'homework_physics.txt', content: 'Q1. ...\n\n(dog ate it. we do not have a dog.)' },
]

export function findPath(path: string[]): FileNode | null {
  let node: FileNode = drive
  for (const p of path.slice(1)) {
    if (node.kind !== 'folder') return null
    const next: FileNode | undefined = node.children.find(c => c.name === p)
    if (!next) return null
    node = next
  }
  return node
}

export function fileIcon(f: FileNode) {
  if (f.kind === 'folder') return f.icon ?? '📁'
  if (f.kind === 'text') return '📄'
  if (f.kind === 'image') return '🖼️'
  if (f.kind === 'link') return '🌐'
  return f.icon ?? '⚙️'
}
