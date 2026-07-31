import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ThemeProvider } from '@mui/material';

import Question from '../components/exam/Question';
import theme from '../theme/theme';

const sampleQuestion = {
  id: 'q1',
  question: 'What is 2 + 2?',
  options: ['1', '2', '3', '4'],
};

const renderQuestion = (overrides = {}) =>
  render(
    <ThemeProvider theme={theme}>
      <Question
        index={0}
        total={3}
        question={sampleQuestion}
        currentAnswer={null}
        onAnswer={jest.fn()}
        onNext={jest.fn()}
        onClear={jest.fn()}
        {...overrides}
      />
    </ThemeProvider>,
  );

describe('Question component', () => {
  it('renders the question text and options', () => {
    renderQuestion();
    expect(screen.getByText('What is 2 + 2?')).toBeInTheDocument();
    expect(screen.getByText('1')).toBeInTheDocument();
    expect(screen.getByText('4')).toBeInTheDocument();
    expect(screen.getByText(/Question 1 of 3/i)).toBeInTheDocument();
  });

  it('disables Save & next until an option is selected', () => {
    renderQuestion();
    expect(screen.getByRole('button', { name: /save & next/i })).toBeDisabled();
  });

  it('emits onAnswer with the selected index', async () => {
    const onAnswer = jest.fn();
    renderQuestion({ onAnswer });
    const radios = screen.getAllByRole('radio');
    await userEvent.click(radios[3]);
    await userEvent.click(screen.getByRole('button', { name: /save & next/i }));
    expect(onAnswer).toHaveBeenCalledWith(3);
  });

  it('shows "Answered" chip when currentAnswer is provided', () => {
    renderQuestion({ currentAnswer: 2 });
    expect(screen.getByText(/answered/i)).toBeInTheDocument();
  });
});
