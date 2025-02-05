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
    { name: "Альф", score: "4.0", position: "1", discount: "100%*" },
    { name: "СексШоп", score: "3.8", position: "2", discount: "50%*" },
    { name: "Котик", score: "3.6", position: "3", discount: "25%*" },
    { name: "Макларен", score: "3.4", position: "4" },
    { name: "Изи", score: "3.0", position: "5" },
    { name: "ПокаТак", score: "3.0", position: "6" },
    { name: "Шляпа", score: "2.8", position: "7" },
    { name: "Яблоко", score: "2.6", position: "8" },
    { name: "Жан", score: "2.6", position: "9" },
    { name: "Сахарок", score: "2.0", position: "10" }
  ]);

  const handleEdit = (field: string, value: string, index?: number) => {
    if (index !== undefined) {
      const newPlayers = [...players];
      if (field === 'name') newPlayers[index].name = value;
      if (field === 'score') newPlayers[index].score = value;
      if (field === 'position') newPlayers[index].position = value;
      if (field === 'discount' && newPlayers[index].discount) {
        newPlayers[index].discount = value.replace(/^-+/, '');
      }
      setPlayers(newPlayers);
    } else {
      if (field === 'title') setTitle(value);
      if (field === 'date') setDate(value);
    }
    setEditingField(null);
    setEditValue("");
  };

  const EditableField = ({ 
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
      return <Trophy className="w-14 h-14 text-yellow-400 drop-shadow-[0_0_10px_rgba(251,191,36,0.5)]" />;
    case 2:
      return <Award className="w-11 h-11 text-slate-300" />;
    case 3:
      return <Award className="w-8 h-8 text-amber-500" />;
    default:
      return null;
  }
};
  return (
      <div
          className="min-h-screen bg-[url('https://images.unsplash.com/photo-1579546929518-9e396f3cc809?w=1600&q=80')] bg-cover bg-center bg-no-repeat flex items-center justify-center p-4">
        <div
            className="w-80 bg-gradient-to-b from-gray-900/95 to-gray-800/95 backdrop-blur-sm rounded-xl p-4 border border-amber-500/30 shadow-lg">
          {/* Header with decorative elements */}
          <div className="relative text-center mb-6">
            <div
                className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-amber-500/50 to-transparent"></div>
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
            <div
                className="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-amber-600/50 to-transparent"></div>
          </div>

          {/* Top 3 Podium */}
          <div className="flex justify-between items-end mb-6 px-2">
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

          {/* Players list 4-10 */}
          <div className="space-y-2">
            {players.slice(3).map((player, index) => (
                <div key={index + 3}
                     className="flex items-center justify-between p-3 bg-black/20 rounded-lg border border-amber-900/20 hover:border-amber-600/30 transition-colors">
                  <div className="flex items-center gap-3">
                    <EditableField
                        value={player.position || `${index + 4}`}
                        field="position"
                        index={index + 3}
                        className="text-amber-500/80"
                    />
                    <EditableField
                        value={player.name}
                        field="name"
                        index={index + 3}
                        className="text-gray-300"
                    />
                  </div>
                  <EditableField
                      value={player.score}
                      field="score"
                      index={index + 3}
                      className="text-gray-400"
                  />
                </div>
            ))}
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
  );
}


export default App;
