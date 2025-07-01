import React, { useState } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { Plus, Trash2, GamepadIcon, Award } from 'lucide-react';
import { toast } from 'react-hot-toast';
import Button from '../common/Button';
import Input from '../common/Input';

const GameForm = ({ 
  game = null, 
  onSubmit, 
  onCancel, 
  isLoading = false,
  boothId = null 
}) => {
  const { register, control, handleSubmit, watch, formState: { errors } } = useForm({
    defaultValues: {
      game_name: game?.game_name || '',
      game_type: game?.game_type || 'quiz',
      rules: game?.rules || '',
      reward_points: game?.reward_points || 10,
      time_limit: game?.time_limit || 300,
      questions: game?.questions || [
        { question_text: '', options: ['', '', '', ''], correct_answer: '', points: 1 }
      ]
    }
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'questions'
  });

  const watchGameType = watch('game_type');
  const watchRewardPoints = watch('reward_points');

  const gameTypes = [
    { value: 'quiz', label: 'Trắc nghiệm', description: 'Câu hỏi trắc nghiệm nhiều lựa chọn' },
    { value: 'true_false', label: 'Đúng/Sai', description: 'Câu hỏi đúng hoặc sai' },
    { value: 'fill_blank', label: 'Điền từ', description: 'Điền từ vào chỗ trống' }
  ];

  const addQuestion = () => {
    append({ 
      question_text: '', 
      options: ['', '', '', ''], 
      correct_answer: '', 
      points: 1 
    });
  };

  const removeQuestion = (index) => {
    if (fields.length > 1) {
      remove(index);
    } else {
      toast.error('Phải có ít nhất 1 câu hỏi');
    }
  };

  const onFormSubmit = (data) => {
    const validQuestions = data.questions.filter(q => 
      q.question_text.trim() && 
      q.correct_answer.trim() &&
      (watchGameType === 'quiz' ? q.options.some(opt => opt.trim()) : true)
    );

    if (validQuestions.length === 0) {
      toast.error('Phải có ít nhất 1 câu hỏi hợp lệ');
      return;
    }

    const formData = {
      ...data,
      booth_id: boothId,
      questions: validQuestions,
      reward_points: parseInt(data.reward_points),
      time_limit: parseInt(data.time_limit)
    };

    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-6">
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-gray-900">Cài đặt game</h3>
        
        <Input
          label="Tên game"
          required
          placeholder="Nhập tên game"
          leftIcon={<GamepadIcon size={20} />}
          error={errors.game_name?.message}
          {...register('game_name', {
            required: 'Tên game là bắt buộc',
            minLength: {
              value: 3,
              message: 'Tên game phải có ít nhất 3 ký tự'
            }
          })}
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Loại game <span className="text-red-500">*</span>
            </label>
            <select
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              {...register('game_type', {
                required: 'Loại game là bắt buộc'
              })}
            >
              {gameTypes.map(type => (
                <option key={type.value} value={type.value}>
                  {type.label}
                </option>
              ))}
            </select>
            {watchGameType && (
              <p className="mt-1 text-xs text-gray-500">
                {gameTypes.find(t => t.value === watchGameType)?.description}
              </p>
            )}
          </div>

          <div>
            <Input
              label="Điểm thưởng"
              type="number"
              required
              placeholder="10"
              leftIcon={<Award size={20} />}
              hint="Tổng điểm tối đa nhận được"
              error={errors.reward_points?.message}
              {...register('reward_points', {
                required: 'Điểm thưởng là bắt buộc',
                min: {
                  value: 1,
                  message: 'Điểm thưởng tối thiểu là 1'
                },
                max: {
                  value: 100,
                  message: 'Điểm thưởng tối đa là 100'
                }
              })}
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input
            label="Thời gian (giây)"
            type="number"
            placeholder="300"
            hint="Thời gian làm bài, để trống nếu không giới hạn"
            error={errors.time_limit?.message}
            {...register('time_limit', {
              min: {
                value: 30,
                message: 'Thời gian tối thiểu 30 giây'
              }
            })}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Luật chơi <span className="text-red-500">*</span>
          </label>
          <textarea
            rows={3}
            placeholder="Mô tả luật chơi và cách tính điểm..."
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            {...register('rules', {
              required: 'Luật chơi là bắt buộc',
              minLength: {
                value: 20,
                message: 'Luật chơi phải có ít nhất 20 ký tự'
              }
            })}
          />
          {errors.rules && (
            <p className="mt-1 text-sm text-red-600">{errors.rules.message}</p>
          )}
        </div>
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-900">
            Câu hỏi ({fields.length})
          </h3>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={addQuestion}
            icon={<Plus size={16} />}
          >
            Thêm câu hỏi
          </Button>
        </div>

        <div className="space-y-6">
          {fields.map((field, index) => (
            <div key={field.id} className="p-6 border border-gray-200 rounded-lg">
              <div className="flex items-center justify-between mb-4">
                <h4 className="font-medium text-gray-900">Câu hỏi {index + 1}</h4>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => removeQuestion(index)}
                  icon={<Trash2 size={16} />}
                  className="text-red-600 border-red-300 hover:bg-red-50"
                  disabled={fields.length === 1}
                >
                  Xóa
                </Button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Nội dung câu hỏi <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    rows={2}
                    placeholder="Nhập nội dung câu hỏi..."
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    {...register(`questions.${index}.question_text`, {
                      required: 'Nội dung câu hỏi là bắt buộc'
                    })}
                  />
                </div>

                {watchGameType === 'quiz' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Các lựa chọn
                    </label>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {[0, 1, 2, 3].map((optionIndex) => (
                        <div key={optionIndex}>
                          <label className="block text-xs text-gray-500 mb-1">
                            Lựa chọn {String.fromCharCode(65 + optionIndex)}
                          </label>
                          <input
                            type="text"
                            placeholder={`Lựa chọn ${String.fromCharCode(65 + optionIndex)}`}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            {...register(`questions.${index}.options.${optionIndex}`)}
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Đáp án đúng <span className="text-red-500">*</span>
                    </label>
                    {watchGameType === 'quiz' ? (
                      <select
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        {...register(`questions.${index}.correct_answer`, {
                          required: 'Đáp án đúng là bắt buộc'
                        })}
                      >
                        <option value="">Chọn đáp án</option>
                        <option value="A">Lựa chọn A</option>
                        <option value="B">Lựa chọn B</option>
                        <option value="C">Lựa chọn C</option>
                        <option value="D">Lựa chọn D</option>
                      </select>
                    ) : (
                      <input
                        type="text"
                        placeholder="Nhập đáp án đúng..."
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        {...register(`questions.${index}.correct_answer`, {
                          required: 'Đáp án đúng là bắt buộc'
                        })}
                      />
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Điểm cho câu này
                    </label>
                    <input
                      type="number"
                      min="1"
                      placeholder="1"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      {...register(`questions.${index}.points`, {
                        min: { value: 1, message: 'Điểm tối thiểu là 1' }
                      })}
                    />
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {fields.length === 0 && (
          <div className="text-center py-8 border-2 border-dashed border-gray-300 rounded-lg">
            <p className="text-gray-500 mb-4">Chưa có câu hỏi nào</p>
            <Button
              type="button"
              variant="outline"
              onClick={addQuestion}
              icon={<Plus size={16} />}
            >
              Thêm câu hỏi đầu tiên
            </Button>
          </div>
        )}
      </div>

      {fields.length > 0 && (
        <div className="p-4 bg-blue-50 rounded-lg">
          <h4 className="font-medium text-blue-900 mb-2">Tóm tắt game:</h4>
          <div className="text-sm text-blue-800 space-y-1">
            <div>Số câu hỏi: {fields.length}</div>
            <div>Tổng điểm tối đa: {watchRewardPoints} điểm</div>
            <div>Thời gian: {watch('time_limit') ? `${watch('time_limit')} giây` : 'Không giới hạn'}</div>
          </div>
        </div>
      )}

      <div className="flex justify-end space-x-3 pt-6 border-t">
        <Button 
          type="button" 
          variant="outline" 
          onClick={onCancel}
          disabled={isLoading}
        >
          Hủy
        </Button>
        <Button 
          type="submit" 
          loading={isLoading}
        >
          {game ? 'Cập nhật' : 'Tạo'} game
        </Button>
      </div>
    </form>
  );
};

export default GameForm;