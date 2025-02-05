import { useState } from 'react';
import { Trophy, Award } from 'lucide-react';

interface Player {
  name: string;
  score: string;
  position?: string;
  discount?: string;
}
function App() {
  const [title, setTitle] = useState("MafiaCartel");
  const [date, setDate] = useState("Класика 04.02.25");
  const [footnote] = useState("* - знижка на наступну гру");
  const [editingField, setEditingField] = useState<string | null>(null);
  const [editValue, setEditValue] = useState("");
  const [players, setPlayers] = useState<Player[]>([
    { name: "Альф", scores: [1.2, 1.4, 1.4, 0], position: "1", discount: "100%*" },
    { name: "СексШоп", scores: [1, 1, 1.8, 0], position: "2", discount: "50%*" },
    { name: "Котик", scores: [0, 1, 1, 1.6], position: "3", discount: "25%*" },
    { name: "Макларен", scores: [1, 1, 1.4, 0], position: "4" },
    { name: "Изи", scores: [1, 1, 1, 0], position: "5" },
    { name: "ПокаТак", scores: [0, 0, 1.4, 1.6], position: "6" },
    { name: "Шляпа", scores: [0, 1, 0, 1.8], position: "7" },
    { name: "Яблоко", scores: [1, -0.3, 1.2, 0.7], position: "8" },
    { name: "Жан", scores: [1.4, 0, 1.2, 0], position: "9" },
    { name: "Сахарок", scores: [1, 1, 0, 0], position: "10" }
  ]);

  const [textData, setTextData] = useState(() => {
    return players.map(player =>
        `${player.name}\t${player.scores.join('\t')}\t${player.position || ''}\t${player.discount || ''}`
    ).join('\n');
  });

  const [columnCount, setColumnCount] = useState(() => {
    const firstLine = textData.split('\n')[0];
    return firstLine.split('\t').length - 3;
  });

  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setTextData(e.target.value);
    try {
      const lines = e.target.value.split('\n');
      const firstLine = lines[0];
      const columns = firstLine.split('\t').length - 3;
      setColumnCount(columns);

      const newPlayers = lines.map(line => {
        const [name, ...rest] = line.split('\t');
        const scores = rest.slice(0, columns).map(Number);
        const position = rest[columns];
        const discount = rest[columns + 1];
        return {
          name,
          scores,
          position,
          discount
        };
      });
      setPlayers(newPlayers);
    } catch (error) {
      // Continue editing if parsing fails
    }
  };

  const handleEdit = (field: string, value: string, index?: number) => {
    if (index !== undefined) {
      const newPlayers = [...players];
      if (field === 'name') newPlayers[index].name = value;
      if (field.startsWith('score')) {
        const scoreIndex = parseInt(field.replace('score', ''));
        newPlayers[index].scores[scoreIndex] = parseFloat(value) || 0;
      }
      if (field === 'position') newPlayers[index].position = value;
      if (field === 'discount' && newPlayers[index].discount) {
        newPlayers[index].discount = value.replace(/^-+/, '');
      }      setPlayers(newPlayers);
    } else {
      if (field === 'title') setTitle(value);
      if (field === 'date') setDate(value);
    }
    setEditingField(null);
    setEditValue("");
  };  const EditableField = ({ 
    value, 
    field, 
    index, 
    className,
    prefix = '' 
  }: { 
    value: string, 
    field: string, 
    index?: number,
    className?: string,
    prefix?: string 
  }) => {
    const fieldId = `${field}-${index ?? 'header'}`;
    
    if (editingField === fieldId) {
      return (
        <input
          className={`bg-transparent border-b border-amber-500 outline-none text-center ${className}`}
          value={editValue}
          onChange={(e) => setEditValue(e.target.value)}
          onBlur={() => handleEdit(field, editValue || value, index)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              handleEdit(field, editValue || value, index);
            }
          }}
          autoFocus
        />
      );
    }
    
    return (
      <div
        className={`cursor-pointer ${className}`}
        onClick={() => {
          setEditingField(fieldId);
          setEditValue(value);
        }}
      >
        {prefix}{value}
      </div>
    );
  };

const TrophyIcon = ({ position }: { position: number }) => {
  switch (position) {
    case 1:
      return <Trophy className="w-20 h-20 text-yellow-400 drop-shadow-[0_0_10px_rgba(251,191,36,0.5)]" />;
    case 2:
      return <Award className="w-16 h-16 text-slate-300" />;
    case 3:
      return <Award className="w-14 h-14 text-amber-500" />;
    default:
      return null;
  }
};
  return (
      <div className="min-h-screen bg-[url('https://images.unsplash.com/photo-1579546929518-9e396f3cc809?w=1600&q=80')] bg-cover bg-center bg-no-repeat flex items-center justify-center p-4">
        <div className="flex gap-4">
          {/* Text Editor */}
          <div className="w-[400px] bg-gradient-to-b from-gray-900/95 to-gray-800/95 backdrop-blur-sm rounded-xl p-4 border border-amber-500/30 shadow-lg">
            <textarea
              className="w-full h-[600px] bg-transparent text-amber-500 font-mono text-sm p-2 border border-amber-500/30 rounded focus:outline-none focus:border-amber-500"
              value={textData}
              onChange={(e) => {
                setTextData(e.target.value);
                try {
                  const newPlayers = e.target.value.split('\n').map(line => {
                    const [name, ...rest] = line.split('\t');
                    const scores = rest.slice(0, 4).map(Number);
                    const position = rest[4];
                    const discount = rest[5];
                    return {
                      name,
                      scores,
                      position,
                      discount
                    };
                  });
                  setPlayers(newPlayers);
                } catch (error) {
                  // Continue editing even if parsing fails
                }
              }}
            />
          </div>

          {/* Existing Leaderboard */}
          <div className="w-[450px] bg-gradient-to-b from-gray-900/95 to-gray-800/95 backdrop-blur-sm rounded-xl p-4 border border-amber-500/30 shadow-lg">
            {/* Header with decorative elements */}
            <div className="relative text-center mb-6">
              <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-amber-500/50 to-transparent"></div>
              <EditableField
                  value={title}
                  field="title"
                  className="text-amber-500 text-2xl font-cinzel font-bold py-2 italic"
              />
              <EditableField
                  value={date}
                  field="date"
                  className="text-amber-400/80 text-sm font-cinzel font-bold py-2 italic"
              />
              <div className="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-amber-600/50 to-transparent"></div>
            </div>

            {/* Top 3 Podium */}
            <div className="flex justify-center items-end mb-6 gap-9">
              {/* Second Place */}
              <div className="text-center">
                <div className="flex justify-center mb-2">
                  <TrophyIcon position={2}/>
                </div>
                <EditableField
                    value={players[1].name}
                    field="name"
                    index={1}
                    className="text-gray-300 font-bold text-sm"
                />
                <EditableField
                    value={players[1].score}
                    field="score"
                    index={1}
                    className="text-gray-300 font-bold"
                />
                {players[1].discount && (
                    <EditableField
                        value={players[1].discount}
                        field="discount"
                        index={1}
                        className="text-green-400 text-sm font-bold"
                        prefix="-"
                    />
                )}
              </div>

              {/* First Place */}
              <div className="text-center -mt-4">
                <div className="flex justify-center mb-2">
                  <TrophyIcon position={1}/>
                </div>
                <EditableField
                    value={players[0].name}
                    field="name"
                    index={0}
                    className="text-amber-400 font-bold text-sm"
                />
                <EditableField
                    value={players[0].score}
                    field="score"
                    index={0}
                    className="text-amber-400 font-bold"
                />
                {players[0].discount && (
                    <EditableField
                        value={players[0].discount}
                        field="discount"
                        index={0}
                        className="text-green-400 text-sm font-bold"
                        prefix="-"
                    />
                )}
              </div>

              {/* Third Place */}
              <div className="text-center">
                <div className="flex justify-center mb-2">
                  <TrophyIcon position={3}/>
                </div>
                <EditableField
                    value={players[2].name}
                    field="name"
                    index={2}
                    className="text-amber-500 font-bold text-sm"
                />
                <EditableField
                    value={players[2].score}
                    field="score"
                    index={2}
                    className="text-amber-500 font-bold"
                />
                {players[2].discount && (
                    <EditableField
                        value={players[2].discount}
                        field="discount"
                        index={2}
                        className="text-green-400 text-sm font-bold"
                        prefix="-"
                    />
                )}
              </div>
            </div>

              {/* Players list with scores */}
              <div className="space-y-2 max-w-full">
                {/* Header row */}
                <div className="flex items-center p-3 bg-amber-500/20 rounded-lg">
                  <div className="w-8 text-center">№</div>
                  <div className="w-24 ml-2"></div>
                  <div className="flex ml-auto">
                    {Array.from({length: columnCount}, (_, i) => (
                        <div key={i} className="w-12 text-center">{i + 1}</div>
                    ))}
                    <div className="w-16 text-center">Total</div>
                  </div>
                </div>

                {players.map((player, index) => {
                  const total = player.scores.reduce((sum, score) => sum + score, 0)

                  return (
                      <div key={index}
                           className="flex items-center p-3 bg-black/20 rounded-lg border border-amber-900/20 hover:border-amber-600/30 transition-colors">
                      <div className="w-8 text-center">
                        <EditableField
                          value={player.position || `${index + 1}`}
                          field="position"
                          index={index}
                          className="text-amber-500/80"
                        />
                      </div>
                      <div className="w-24 ml-2">
                        <EditableField
                          value={player.name}
                          field="name"
                          index={index}
                          className="text-gray-300"
                        />
                      </div>
                      <div className="flex ml-auto">
                        {player.scores.map((score, scoreIndex) => (
                          <div key={scoreIndex} className="w-12 text-center text-gray-400">
                            {score.toFixed(1)}
                          </div>
                        ))}
                        <div className="w-16 text-center text-amber-500 font-bold">
                          {total.toFixed(1)}
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>

            <div className="mt-4 text-center">
              <EditableField
                  value={footnote}
                  field="footnote"
                  className="text-green-400 text-sm font-bold"
              />
            </div>
          </div>
        </div>

      </div>
  );
}


export default App;
