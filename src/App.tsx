import { useState, useCallback } from 'react';
import * as htmlToImage from 'html-to-image';
import { Trophy, Award } from 'lucide-react';

interface Player {
  name: string;
  scores: number[];
  position?: string;
  discount?: string;
}

export default function App() {
  const [gameState, setGameState] = useState({
    title: "MafiaCartel",
    date: "Класика 04.02.25",
    footnote: "* - знижка на наступну гру"
  });

  const calculateTotal = (scores: number[]) => scores.reduce((sum, score) => sum + score, 0);

  const [players, setPlayers] = useState<Player[]>(() => {
    const initialPlayers = [
      { name: "Альф", scores: [1.2, 1.4, 1.4, 0], position: "1" },
      { name: "СексШоп", scores: [1, 1, 1.8, 0], position: "2" },
      { name: "Котик", scores: [0, 1, 1, 1.6], position: "3" },
      { name: "Макларен", scores: [1, 1, 1.4, 0], position: "4" },
      { name: "Изи", scores: [1, 1, 1, 0], position: "5-6" },
      { name: "ПокаТак", scores: [0, 0, 1.4, 1.6], position: "5-6" },
      { name: "Шляпа", scores: [0, 1, 0, 1.8], position: "7" },
      { name: "Яблоко", scores: [1, -0.3, 1.2, 0.7], position: "8-9" },
      { name: "Жан", scores: [1.4, 0, 1.2, 0], position: "8-9" },
      { name: "Сахарок", scores: [1, 1, 0, 0], position: "10" }
    ];

    return initialPlayers.sort((a, b) => calculateTotal(b.scores) - calculateTotal(a.scores));
  });

  const [editingField, setEditingField] = useState<string | null>(null);
  const [editValue, setEditValue] = useState("");
  const [showMiddleColumns, setShowMiddleColumns] = useState(true);

    const [textData, setTextData] = useState(() => {
      const dateText = `Дата: ${gameState.date}\n`;
      return dateText + players.map(player => `${player.name}    ${player.scores.join('  ')}`).join('\n');
    });
    
  const downloadAsPng = useCallback(() => {
    const leaderboardElement = document.getElementById('leaderboard');
    if (leaderboardElement) {
      htmlToImage
        .toPng(leaderboardElement, {
          quality: 1.0,
          backgroundColor: 'transparent',
          pixelRatio: 2
        })
        .then((dataUrl) => {
          const link = document.createElement('a');
          link.download = `${gameState.title}-${gameState.date}.png`;
          link.href = dataUrl;
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
        })
        .catch((error) => {
          console.log('Error generating image:', error);
        });
    }
  }, [gameState.title, gameState.date]);

  const handleEdit = useCallback((field: string, value: string, index?: number) => {
    if (index !== undefined) {
      setPlayers(prev => {
        const newPlayers = [...prev];
        if (field === 'name') newPlayers[index].name = value;
        if (field.startsWith('score')) {
          const scoreIndex = parseInt(field.replace('score', ''));
          newPlayers[index].scores[scoreIndex] = parseFloat(value) || 0;
        }
        if (field === 'position') newPlayers[index].position = value;
        if (field === 'discount') {
          newPlayers[index].discount = value.replace(/^-+/, '');
        }
        // Sort players by total score
        return newPlayers.sort((a, b) => {
          const totalA = a.scores.reduce((sum, score) => sum + score, 0);
          const totalB = b.scores.reduce((sum, score) => sum + score, 0);
          return totalB - totalA;
        });
      });
    } else {
      setGameState(prev => ({...prev, [field]: value}));
    }
    setEditingField(null);
    setEditValue("");
  }, []);
  const EditableField = useCallback(({
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
        <input              className={`bg-transparent border-b border-amber-500 outline-none text-center ${className}`}
              value={editValue}
              onChange={(e) => setEditValue(e.target.value)}
              onBlur={() => handleEdit(field, editValue || value, index)}
              onKeyDown={(e) => e.key === 'Enter' && handleEdit(field, editValue || value, index)}
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
  }, [editingField, editValue, handleEdit]);
  const TrophyIcon = useCallback(({position}: { position: number }) => {
    const icons = {
      1: <Trophy className="w-20 h-20 text-yellow-400 drop-shadow-[0_0_10px_rgba(251,191,36,0.5)]"/>,
      2: <Award className="w-16 h-16 text-slate-300"/>,
      3: <Award className="w-14 h-14 text-amber-500"/>
    };
    return icons[position as keyof typeof icons] || null;
  }, []);

  const [parseError, setParseError] = useState<string | null>(null);
  const handleTextChange = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newText = e.target.value;
    setTextData(newText);

    try {
      const lines = newText.split('\n').filter(line => line.trim());

      // Check for "Дата: text" format in first line
      if (lines[0] && lines[0].startsWith('Дата:')) {
        const dateText = lines[0].replace('Дата:', '').trim();
        setGameState(prev => ({ ...prev, date: dateText }));
        lines.shift(); // Remove date line
      }

      const newPlayers = lines.map((line, index) => {
        const cleanLine = line.replace(/^\d+\.?\s*/, '').split(/\s*=\s*/)[0].trim();
        
        const firstNumberIndex = cleanLine.search(/[-\d]/);
        const name = firstNumberIndex > -1 
          ? cleanLine.slice(0, firstNumberIndex).trim() 
          : cleanLine.trim();
        
        const scoresText = cleanLine.slice(firstNumberIndex);
        const tokens = scoresText.split(/\s+/).filter(token => /[0-9-]/.test(token));
        
        const scores: number[] = [];
        for (let i = 0; i < tokens.length; i++) {
          if (tokens[i] === '-') {
            const nextNum = Number(tokens[i + 1].replace(',', '.').replace(/[^\d.]/g, ''));
            scores.push(-nextNum);
            i++;
          } else if (tokens[i] === '+') {
            continue;
          } else {
            const cleanToken = tokens[i].replace(/[^\d,.-]/g, '');
            const normalizedToken = cleanToken.replace(',', '.');
            scores.push(Number(normalizedToken));
          }
        }

        const discounts = ['100%*', '50%*', '25%*'];
        const discount = index < 3 ? discounts[index] : undefined;

        return {
          name,
          scores,
          discount
        };
      }).filter(player => player.name && player.scores.length > 0);

      if (newPlayers.length > 0) {
        const maxScores = Math.max(...newPlayers.map(p => p.scores.length));
        const normalizedPlayers = newPlayers.map(player => ({
          ...player,
          scores: [...player.scores, ...Array(maxScores - player.scores.length).fill(0)]
        }));

        const sortedPlayers = normalizedPlayers.sort((a, b) => {
          const totalA = a.scores.reduce((sum, score) => sum + score, 0);
          const totalB = b.scores.reduce((sum, score) => sum + score, 0);
          return totalB - totalA;
        });

        const groups: Player[][] = [];
        let currentGroup: Player[] = [sortedPlayers[0]];
        
        for (let i = 1; i < sortedPlayers.length; i++) {
          const currentTotal = sortedPlayers[i].scores.reduce((sum, score) => sum + score, 0);
          const prevTotal = sortedPlayers[i-1].scores.reduce((sum, score) => sum + score, 0);
          
          if (currentTotal === prevTotal) {
            currentGroup.push(sortedPlayers[i]);
          } else {
            groups.push(currentGroup);
            currentGroup = [sortedPlayers[i]];
          }
        }
        groups.push(currentGroup);

        let currentPosition = 1;
        const playersWithPositions = groups.flatMap(group => {
          const position = group.length === 1 
            ? String(currentPosition)
            : `${currentPosition}-${currentPosition + group.length - 1}`;
          
          const result = group.map(player => ({
            ...player,
            position
          }));
          
          currentPosition += group.length;
          return result;
        });
        
        setPlayers(playersWithPositions);
      }
      setParseError(null);
    } catch (error) {
      setParseError("Неправильний формат тексту");
    }
  }, []);  return (
      <div className="min-h-screen bg-[url('https://images.unsplash.com/photo-1579546929518-9e396f3cc809?w=1600&q=80')] bg-cover bg-center bg-no-repeat flex items-center justify-center p-2 md:p-4 overflow-x-hidden">
        <div className="flex flex-col md:flex-row gap-4 w-full max-w-[850px]">
          {/* Text Editor Panel */}
          <div
              className="w-full md:w-[400px] bg-gradient-to-b from-gray-900/95 to-gray-800/95 backdrop-blur-sm rounded-xl p-4 border border-amber-500/30 shadow-lg">
  <textarea
      className="w-full h-[300px] md:h-[600px] bg-transparent text-amber-500 font-mono text-sm p-2 border border-amber-500/30 rounded focus:outline-none focus:border-amber-500"
      value={textData}
      onChange={handleTextChange}
  /> {parseError && (
              <div className="mt-2 text-red-500 text-sm font-mono">
                {parseError}
              </div>
          )}
            <button
                onClick={() => setShowMiddleColumns(!showMiddleColumns)}
                className="mt-4 w-full text-amber-500 text-sm border border-amber-500/30 rounded px-3 py-1 hover:bg-amber-500/20 transition-colors"
            >
              {showMiddleColumns ? 'Приховати проміжні бали' : 'Показати проміжні бали'}
            </button>
            <button
                onClick={downloadAsPng}
                className="mt-4 w-full text-amber-500 text-sm border border-amber-500/30 rounded px-3 py-1 hover:bg-amber-500/20 transition-colors"
            >
              Завантажити як png
            </button>
          </div>

          {/* Leaderboard Panel */}

          <div id="leaderboard"
               className={`${showMiddleColumns ? 'w-full md:w-[450px]' : 'w-full md:w-[300px]'} bg-gradient-to-b from-gray-900/95 to-gray-800/95 backdrop-blur-sm rounded-xl p-2 md:p-4 border border-amber-500/30 shadow-lg`}>
            {/* Header */}
            <div className="relative text-center mb-6">
              <div
                  className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-amber-500/50 to-transparent"/>
              <EditableField
                  value={gameState.title}
                  field="title"
                  className="text-4xl font-black tracking-tighter bg-gradient-to-r from-red-500 via-amber-800/90 to-red-500 bg-clip-text text-transparent drop-shadow-[0_2px_2px_rgba(0,0,0,0.8)] transform hover:scale-105 transition-transform py-2 italic"
              />
              <EditableField
                  value={gameState.date}
                  field="date"
                  className="text-amber-400/80 text-sm font-bold italic"
              />
              <div
                  className="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-amber-600/50 to-transparent"/>
            </div>

            {/* Top 3 Podium */}
            <div className="flex justify-center items-end mb-6 gap-9">
              {players.length >= 2 && (
                  <div className="text-center min-w-[80px]">
                    <div className="flex justify-center mb-2">
                      <TrophyIcon position={2}/>
                    </div>
                    <EditableField
                        value={players[1].name}
                        field="name"
                        index={1}
                        className="text-gray-300 font-bold text-sm"
                    />
                    <div className="text-gray-300 font-bold">
                      {players[1].scores.reduce((sum, score) => sum + score, 0).toFixed(1)}
                    </div>
                      <EditableField
                          value="50%*"
                          field="discount"
                          index={1}
                          className="text-green-400 text-sm font-bold"
                          prefix="-"
                      />
                  </div>
              )}

              {players.length >= 1 && (
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
                    <div className="text-amber-400 font-bold">
                      {players[0].scores.reduce((sum, score) => sum + score, 0).toFixed(1)}
                    </div>
                      <EditableField
                          value="100%*"
                          field="discount"
                          index={0}
                          className="text-green-400 text-sm font-bold"
                          prefix="-"
                      />
                  </div>
              )}

              {players.length >= 3 && (
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
                    <div className="text-amber-500 font-bold">
                      {players[2].scores.reduce((sum, score) => sum + score, 0).toFixed(1)}
                    </div>
                      <EditableField
                          value="25%*"
                          field="discount"
                          index={2}
                          className="text-green-400 text-sm font-bold"
                          prefix="-"
                      />
                  </div>
              )}            </div>
            {/* Players list with scores */}
            <div className="space-y-1 max-w-full">

              {players.map((player, index) => {

                return (
                    <div key={index}
                         className="flex items-center p-2 bg-black/20 rounded-lg border border-amber-900/20 hover:border-amber-600/30 transition-colors">
                      <div className="w-12 min-w-[48px] text-center whitespace-nowrap overflow-hidden">
                        <EditableField
                            value={player.position || `${index + 1}`}
                            field="position"
                            index={index}
                            className="text-amber-500/80"
                        />
                      </div>
                      <div className={`w-24 ml-2 ${!showMiddleColumns ? 'flex-grow' : ''}`}>
                        <EditableField
                            value={player.name}
                            field="name"
                            index={index}
                            className="text-gray-300"
                        />
                      </div>
                      <div className="flex ml-auto">
                        {showMiddleColumns && player.scores.map((score, scoreIndex) => (
                            <div key={scoreIndex} className="w-10 text-center text-gray-400">
                              {score.toFixed(1)}
                            </div>
                        ))}
                        <div className={`${showMiddleColumns ? 'w-14' : 'w-20'} text-center text-amber-500 font-bold`}>
                          {player.scores.reduce((sum, score) => sum + score, 0).toFixed(1)}
                        </div>
                      </div>
                    </div>
                );
              })}
            </div>

            <div className="mt-4 text-center">
              <EditableField
                  value={gameState.footnote}
                  field="footnote"
                  className="text-green-400 text-sm font-bold"
              />
            </div>
          </div>
        </div>
      </div>
  );
}