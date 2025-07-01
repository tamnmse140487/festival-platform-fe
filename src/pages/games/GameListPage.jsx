import React, { useState } from 'react';
import { Play, Trophy, Star, Clock, Users, GamepadIcon, Plus, Search, Filter } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { mockMiniGames, mockQuestions, mockBooths } from '../../data/mockData';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import Card from '../../components/common/Card';
import Modal from '../../components/common/Modal';

const GameListPage = () => {
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedGame, setSelectedGame] = useState(null);
  const [showGameModal, setShowGameModal] = useState(false);
  const [gameAnswers, setGameAnswers] = useState({});
  const [gameCompleted, setGameCompleted] = useState(false);
  const [gameResult, setGameResult] = useState(null);

  const filteredGames = mockMiniGames.filter(game => 
    game.game_name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handlePlayGame = (game) => {
    setSelectedGame(game);
    setGameAnswers({});
    setGameCompleted(false);
    setGameResult(null);
    setShowGameModal(true);
  };

  const handleAnswerChange = (questionId, answer) => {
    setGameAnswers(prev => ({
      ...prev,
      [questionId]: answer
    }));
  };

  const handleSubmitGame = () => {
    const questions = mockQuestions.filter(q => q.game_id === selectedGame.id);
    let correctAnswers = 0;
    let totalPoints = 0;

    questions.forEach(question => {
      if (gameAnswers[question.id] === question.correct_answer) {
        correctAnswers++;
        totalPoints += question.points;
      }
    });

    const result = {
      correctAnswers,
      totalQuestions: questions.length,
      pointsEarned: totalPoints,
      percentage: Math.round((correctAnswers / questions.length) * 100)
    };

    setGameResult(result);
    setGameCompleted(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Mini Games</h1>
          <p className="text-gray-600 mt-1">
            Chơi game để tích lũy điểm và kiến thức thú vị!
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <Card.Content>
            <div className="flex items-center">
              <div className="p-3 bg-blue-100 rounded-lg">
                <GamepadIcon className="w-6 h-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Game đã chơi</p>
                <p className="text-2xl font-bold text-gray-900">24</p>
              </div>
            </div>
          </Card.Content>
        </Card>

        <Card>
          <Card.Content>
            <div className="flex items-center">
              <div className="p-3 bg-yellow-100 rounded-lg">
                <Star className="w-6 h-6 text-yellow-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Điểm tích lũy</p>
                <p className="text-2xl font-bold text-gray-900">1,250</p>
              </div>
            </div>
          </Card.Content>
        </Card>

        <Card>
          <Card.Content>
            <div className="flex items-center">
              <div className="p-3 bg-green-100 rounded-lg">
                <Trophy className="w-6 h-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Xếp hạng</p>
                <p className="text-2xl font-bold text-gray-900">#15</p>
              </div>
            </div>
          </Card.Content>
        </Card>
      </div>

      <Card>
        <Card.Content>
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="flex-1">
              <Input
                placeholder="Tìm kiếm game..."
                leftIcon={<Search size={20} />}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>

          {filteredGames.length === 0 ? (
            <div className="text-center py-12">
              <GamepadIcon className="mx-auto h-12 w-12 text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Không tìm thấy game nào</h3>
              <p className="text-gray-600">
                {searchTerm 
                  ? 'Thử thay đổi từ khóa tìm kiếm.' 
                  : 'Chưa có game nào khả dụng.'
                }
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {filteredGames.map(game => (
                <GameCard 
                  key={game.id} 
                  game={game} 
                  onPlay={handlePlayGame}
                />
              ))}
            </div>
          )}
        </Card.Content>
      </Card>

      <Modal
        isOpen={showGameModal}
        onClose={() => setShowGameModal(false)}
        title={selectedGame?.game_name || "Mini Game"}
        size="lg"
      >
        {selectedGame && (
          <GamePlayModal 
            game={selectedGame}
            gameAnswers={gameAnswers}
            gameCompleted={gameCompleted}
            gameResult={gameResult}
            onAnswerChange={handleAnswerChange}
            onSubmit={handleSubmitGame}
            onClose={() => setShowGameModal(false)}
          />
        )}
      </Modal>
    </div>
  );
};

const GameCard = ({ game, onPlay }) => {
  const booth = mockBooths.find(b => b.id === game.booth_id);

  return (
    <Card hover className="h-full">
      <Card.Content>
        <div className="flex items-start space-x-4 mb-4">
          <div className="w-16 h-16 bg-purple-100 rounded-lg flex items-center justify-center">
            <GamepadIcon className="w-8 h-8 text-purple-600" />
          </div>
          
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-gray-900 mb-1">
              {game.game_name}
            </h3>
            <p className="text-sm text-gray-600 mb-2">
              Bởi: {booth?.booth_name || 'Gian hàng'}
            </p>
            
            <div className="flex items-center space-x-4 text-sm text-gray-500">
              <div className="flex items-center">
                <Clock size={14} className="mr-1" />
                <span>~5 phút</span>
              </div>
              <div className="flex items-center">
                <Users size={14} className="mr-1" />
                <span>{game.total_plays} lượt chơi</span>
              </div>
              <div className="flex items-center">
                <Star size={14} className="mr-1 text-yellow-400" />
                <span>{game.reward_points} điểm</span>
              </div>
            </div>
          </div>
        </div>

        <div className="mb-4">
          <h4 className="text-sm font-medium text-gray-900 mb-2">Luật chơi:</h4>
          <p className="text-sm text-gray-600">{game.rules}</p>
        </div>

        <div className="flex items-center justify-between">
          <span className={`px-3 py-1 rounded-full text-xs font-medium ${
            game.status === 'active' 
              ? 'bg-green-100 text-green-800' 
              : 'bg-gray-100 text-gray-800'
          }`}>
            {game.status === 'active' ? 'Đang hoạt động' : 'Tạm dừng'}
          </span>
          
          <Button 
            size="sm"
            onClick={() => onPlay(game)}
            disabled={game.status !== 'active'}
            icon={<Play size={16} />}
          >
            Chơi ngay
          </Button>
        </div>
      </Card.Content>
    </Card>
  );
};

const GamePlayModal = ({ 
  game, 
  gameAnswers, 
  gameCompleted, 
  gameResult, 
  onAnswerChange, 
  onSubmit, 
  onClose 
}) => {
  const questions = mockQuestions.filter(q => q.game_id === game.id);
  const allQuestionsAnswered = questions.every(q => gameAnswers[q.id]);

  if (gameCompleted) {
    return (
      <div className="text-center space-y-6">
        <div className="w-20 h-20 mx-auto bg-green-100 rounded-full flex items-center justify-center">
          <Trophy className="w-10 h-10 text-green-600" />
        </div>
        
        <div>
          <h3 className="text-2xl font-bold text-gray-900 mb-2">Chúc mừng!</h3>
          <p className="text-gray-600">Bạn đã hoàn thành game thành công</p>
        </div>

        <div className="grid grid-cols-3 gap-4 py-6">
          <div className="text-center">
            <div className="text-3xl font-bold text-blue-600">{gameResult.correctAnswers}</div>
            <div className="text-sm text-gray-600">Câu đúng</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-green-600">{gameResult.percentage}%</div>
            <div className="text-sm text-gray-600">Độ chính xác</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-yellow-600">{gameResult.pointsEarned}</div>
            <div className="text-sm text-gray-600">Điểm nhận</div>
          </div>
        </div>

        <div className="space-y-2">
          {gameResult.percentage >= 80 && (
            <p className="text-green-600 font-medium">🎉 Xuất sắc! Bạn thật giỏi!</p>
          )}
          {gameResult.percentage >= 60 && gameResult.percentage < 80 && (
            <p className="text-blue-600 font-medium">👍 Tốt lắm! Cố gắng thêm nhé!</p>
          )}
          {gameResult.percentage < 60 && (
            <p className="text-orange-600 font-medium">💪 Cần cố gắng thêm! Chơi lại nhé!</p>
          )}
        </div>

        <div className="flex space-x-3">
          <Button fullWidth onClick={onClose}>
            Đóng
          </Button>
          <Button 
            variant="outline" 
            fullWidth
            onClick={() => window.location.reload()}
          >
            Chơi lại
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-xl font-bold text-gray-900">{game.game_name}</h3>
          <p className="text-gray-600">{questions.length} câu hỏi • {game.reward_points} điểm</p>
        </div>
        <div className="text-right">
          <p className="text-sm text-gray-500">Đã trả lời</p>
          <p className="text-2xl font-bold text-blue-600">
            {Object.keys(gameAnswers).length}/{questions.length}
          </p>
        </div>
      </div>

      <div className="space-y-6">
        {questions.map((question, index) => (
          <div key={question.id} className="border border-gray-200 rounded-lg p-4">
            <div className="flex items-start space-x-3 mb-4">
              <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                <span className="text-sm font-medium text-blue-600">{index + 1}</span>
              </div>
              <div className="flex-1">
                <h4 className="font-medium text-gray-900 mb-3">
                  {question.question_text}
                </h4>
                <div className="space-y-2">
                  {question.options.map((option, optionIndex) => (
                    <label 
                      key={optionIndex}
                      className="flex items-center space-x-3 p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors"
                    >
                      <input
                        type="radio"
                        name={`question-${question.id}`}
                        value={option}
                        checked={gameAnswers[question.id] === option}
                        onChange={(e) => onAnswerChange(question.id, e.target.value)}
                        className="text-blue-600 focus:ring-blue-500"
                      />
                      <span className="text-gray-700">{option}</span>
                    </label>
                  ))}
                </div>
                <div className="mt-2 text-right">
                  <span className="text-xs text-gray-500">
                    {question.points} điểm
                  </span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="flex justify-end space-x-3 pt-4 border-t">
        <Button variant="outline" onClick={onClose}>
          Hủy
        </Button>
        <Button 
          onClick={onSubmit}
          disabled={!allQuestionsAnswered}
          icon={<Trophy size={16} />}
        >
          Nộp bài
        </Button>
      </div>
    </div>
  );
};

export default GameListPage;